import { ClickHouse } from "clickhouse";
import Model from "./model";
import { SchemaTable } from "./schema";
import { Log, DebugLog } from "./log";

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
  autoSync: boolean;
}

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
    const createDatabaseSql = `CREATE DATABASE IF NOT EXISTS ${name}${
      cluster ? ` ON CLUSTER ${cluster}` : ""
    }${engine ? ` ENGINE=${engine}` : ""}`;
    Log(createDatabaseSql);
    return createDatabaseSql;
  }

  createDatabase() {
    const createDatabaseSql = this.getCreateDatabaseSql();
    return this.client.query(createDatabaseSql).toPromise();
  }

  // auto create sql string
  autoCreateTable(
    dbTableName: string,
    schemaConfig: ModelRigisterAndCreateTableParams
  ) {
    if (!schemaConfig.options)
      throw Error("autoCreateTable: `options` is required");

    const {schema, options} = schemaConfig;
    return `
      CREATE TABLE IF NOT EXISTS ${dbTableName} ${
      this.db.cluster ? `ON CLUSTER ${this.db.cluster}` : ""
    }
      (
        ${Object.keys(schema).map(key=>{
          return `${key} ${schema[key].type.columnType}`
        }).join(",")}
      )
      ${options}`;
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

    if ((schemaConfig as ModelRigisterAndCreateTableParams).autoSync) {
      // create table [IF NOT EXISTS]
      const { createTable } = schemaConfig as ModelRigisterAndCreateTableParams;
      const createSql = createTable
        ? createTable(dbTableName, this.db)
        : this.autoCreateTable(
            dbTableName,
            schemaConfig as ModelRigisterAndCreateTableParams
          );
      if (this.debug) DebugLog(`execute model> ${createSql}`);
      await this.client.query(createSql).toPromise();
    }

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
