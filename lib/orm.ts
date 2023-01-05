import { ClickHouse } from "clickhouse";
import Model from "./model";
import { SchemaConfig } from "./schema";
import { getClusterStr, getDatabaseEngineStr } from "./transformer";
import { Log, ErrorLog } from "./log";
import { dataTypeFilterUnnecessarySpace } from "./utils";

/**
 * name:string
 */
export interface DbParams {
  name: string;
  engine?: string; // default: Atomic
  cluster?: string;
}
export interface OrmInitParams {
  client: ClickHouse;
  db: DbParams;
  debug: boolean;
}

export interface ModelParams {
  tableName: string;
  schema: SchemaConfig;
}
export interface ModelSyncTableParams {
  tableName: string;
  schema: SchemaConfig;
  autoCreate: boolean;
  options?: string;
  autoSync?: boolean;
}
export interface ModelSqlCreateTableParams {
  tableName: string;
  schema: SchemaConfig;
  createTable?: (dbTableName: string, db: DbParams) => string;
}

type TableMeta = { name: string; type: string }[];
export default class ClickhouseOrm {
  client: ClickHouse;
  db: DbParams;
  debug: boolean;
  models = {};

  constructor({ client, db, debug }: OrmInitParams) {
    this.client = client;
    this.db = db;
    this.debug = debug;
  }

  getCreateDatabaseSql() {
    const { name, engine, cluster } = this.db;
    const createDatabaseSql = `CREATE DATABASE IF NOT EXISTS ${name} ${getClusterStr(
      cluster
    )} ${getDatabaseEngineStr(engine)}`;
    Log(createDatabaseSql);
    return createDatabaseSql;
  }

  createDatabase() {
    const createDatabaseSql = this.getCreateDatabaseSql();
    return this.client.query(createDatabaseSql).toPromise();
  }

  // get table meta info or table doesn't exist
  async getTableMeta(dbTableName: string) {
    try {
      const info = await this.client
        .query(`select * from ${dbTableName} limit 0`)
        ["withTotals"]()
        .toPromise();
      return info.meta;
    } catch (err) {
      if (err.code === 60 || err.message.indexOf(`doesn't exist`) !== -1)
        return false;
    }
  }

  // diff
  diffTableMeta(codeSchema: SchemaConfig, tableMeta: TableMeta) {
    const tableMetaMap = {};
    tableMeta.forEach((column) => {
      tableMetaMap[column.name] = column.type;
    });
    const addColumns = [],
      modifyColumns = [];
    Object.keys(codeSchema).map((columnName) => {
      if (tableMetaMap[columnName]) {
        if (
          dataTypeFilterUnnecessarySpace(codeSchema[columnName].type.columnType) !==
          dataTypeFilterUnnecessarySpace(tableMetaMap[columnName])
        ) {
          modifyColumns.push({
            name: columnName,
            type: codeSchema[columnName].type.columnType,
          });
        }
        delete tableMetaMap[columnName];
      } else {
        addColumns.push({
          name: columnName,
          type: codeSchema[columnName].type.columnType,
        });
      }
    });
    const deleteColumns = Object.keys(tableMetaMap);

    return {
      deleteColumns,
      addColumns,
      modifyColumns,
    };
  }

  syncTable({ deleteColumns, addColumns, modifyColumns, dbTableName }) {
    const list = [];
    const alter = `ALTER TABLE ${dbTableName} ${getClusterStr(
      this.db.cluster
    )}`;
    deleteColumns.forEach((columnName) => {
      const sql = `${alter} DROP COLUMN ${columnName}`;
      list.push(this.client.query(sql).toPromise());
      Log(`sync table structure: ${sql}`);
    });
    addColumns.forEach((item) => {
      const sql = `${alter} ADD COLUMN ${item.name} ${item.type}`;
      list.push(this.client.query(sql).toPromise());
      Log(`sync table structure: ${sql}`);
    });
    modifyColumns.forEach((item) => {
      const sql = `${alter} MODIFY COLUMN ${item.name} ${item.type}`;
      list.push(this.client.query(sql).toPromise());
      Log(`sync table structure: ${sql}`);
    });
    return Promise.all(list);
  }

  // auto create sql string
  autoCreateTableSql(dbTableName: string, modelConfig: ModelSyncTableParams) {
    if (!modelConfig.options)
      throw Error("autoCreate or autoSync: `options` is required");

    const { schema, options } = modelConfig;
    return `
      CREATE TABLE IF NOT EXISTS ${dbTableName} ${getClusterStr(
      this.db.cluster
    )}
      (
        ${Object.keys(schema)
          .map((key) => {
            return `${key} ${schema[key].type.columnType}`;
          })
          .join(",")}
      )
      ${options}`;
  }

  async createAndSync(
    modelConfig: ModelSyncTableParams | ModelSqlCreateTableParams,
    dbTableName: string
  ) {
    const tablemeta = await this.getTableMeta(dbTableName);
    // Table Exists
    if (tablemeta) {
      if ((modelConfig as ModelSyncTableParams).autoSync) {
        const diff = this.diffTableMeta(modelConfig.schema, tablemeta);
        if (
          diff.addColumns.length ||
          diff.deleteColumns.length ||
          diff.modifyColumns.length
        ) {
          try {
            const syncSqlRes = await this.syncTable({
              ...diff,
              dbTableName,
            } as any);
            if (syncSqlRes.length)
              Log(`Sync table '${dbTableName}' structure complete!`);
          } catch (e) {
            const info = `Sync table '${dbTableName}' structure failed and Model create failed:\n ${e}`;
            ErrorLog(info);
            throw new Error(info);
          }
        }
      }
    } else {
      // [IF NOT EXISTS] create table
      const { createTable } = modelConfig as ModelSqlCreateTableParams;
      const createSql = createTable
        ? createTable(dbTableName, this.db)
        : this.autoCreateTableSql(
            dbTableName,
            modelConfig as ModelSyncTableParams
          );
      Log(`Create table> ${createSql}`);
      try {
        await this.client.query(createSql).toPromise();
      } catch (e) {
        const info = `Create table '${dbTableName}' failed and Model create failed:\n ${e}`;
        ErrorLog(info);
        throw new Error(info);
      }
    }
  }

  /**
   * @remark
   * The createDatabase must be completed
   */
  async model(
    modelConfig: ModelParams | ModelSyncTableParams | ModelSqlCreateTableParams
  ) {
    const { tableName, schema } = modelConfig;
    const dbTableName = `${this.db.name}.${tableName}`;

    if (
      (modelConfig as ModelSyncTableParams).autoCreate ||
      (modelConfig as ModelSqlCreateTableParams).createTable
    )
      await this.createAndSync(modelConfig, dbTableName);

    const modelInstance = new Model({
      client: this.client,
      db: this.db,
      dbTableName,
      debug: this.debug,
      schema,
    });

    this.models[tableName] = modelInstance;
    return modelInstance;
  }
}
