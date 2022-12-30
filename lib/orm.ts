import { ClickHouse } from "clickhouse";
import Model from "./model";
import { SchemaTable } from "./schema";
import { getClusterStr } from "./transformer";
import { Log, DebugLog, ErrorLog } from "./log";

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

export interface ModelRigisterParams {
  tableName: string;
  schema: SchemaTable;
}
export interface ModelRigisterAndCreateTableParams {
  tableName: string;
  schema: SchemaTable;
  createTable?: (dbTableName: string, db: DbParams) => string;
  options?: string;
  autoCreate: boolean;
  autoSync?: boolean;
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
    )} ${engine ? ` ENGINE=${engine}` : ""}`;
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
  diffTableMeta(codeSchema: SchemaTable, tableMeta: TableMeta) {
    const tableMetaMap = {};
    tableMeta.forEach((column) => {
      tableMetaMap[column.name] = column.type;
    });
    const addColumns = [],
      modifyColumns = [];
    Object.keys(codeSchema).map((columnName) => {
      if (tableMetaMap[columnName]) {
        if (
          codeSchema[columnName].type.columnType !== tableMetaMap[columnName]
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
  autoCreateTable(
    dbTableName: string,
    schemaConfig: ModelRigisterAndCreateTableParams
  ) {
    if (!schemaConfig.options)
      throw Error("autoCreateTable: `options` is required");

    const { schema, options } = schemaConfig;
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

  async createAndSync(schemaConfig, dbTableName) {
    if (
      (schemaConfig as ModelRigisterAndCreateTableParams).autoSync ||
      (schemaConfig as ModelRigisterAndCreateTableParams).autoCreate
    ) {
      const tablemeta = await this.getTableMeta(dbTableName);
      if (tablemeta) {
        if (schemaConfig.autoSync) {
          const diff = this.diffTableMeta(schemaConfig.schema, tablemeta);
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
        if (schemaConfig.autoCreate) {
          // [IF NOT EXISTS] create table
          const { createTable } =
            schemaConfig as ModelRigisterAndCreateTableParams;
          const createSql = createTable
            ? createTable(dbTableName, this.db)
            : this.autoCreateTable(
                dbTableName,
                schemaConfig as ModelRigisterAndCreateTableParams
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
    }
  }

  /**
   * @remark
   * The createDatabase must be completed
   */
  async model(
    schemaConfig: ModelRigisterParams | ModelRigisterAndCreateTableParams
  ) {
    const { tableName, schema } = schemaConfig;
    const dbTableName = `${this.db.name}.${tableName}`;

    await this.createAndSync(schemaConfig, dbTableName);

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
