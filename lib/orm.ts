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
  createTable: (dbTableName: string, db: DbParams) => string;
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

  /**
   * @remark
   * The createDatabase must be completed
   */
  async model({ tableName, schema, createTable }: ModelRigisterParams) {
    const dbTableName = `${this.db.name}.${tableName}`;
    // create table
    const createSql = createTable(dbTableName, this.db);
    if (this.debug) DebugLog(`execute model> ${createSql}`);
    await this.client.query(createSql).toPromise();

    const modelInstance = new Model({
      client: this.client,
      dbTableName,
      debug: this.debug,
      schema,
    });

    this.models[tableName] = modelInstance;
    return modelInstance;
  }
}
