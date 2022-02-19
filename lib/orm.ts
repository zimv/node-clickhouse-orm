import { ClickHouse } from 'clickhouse';
import { getPureData, insertSQL, object2Sql, SqlObject } from './transformer';
import Model from './model';
import Schema from './schema';
import { Log, DebugLog } from './log';

export interface OrmInitParams {
  client: ClickHouse;
  db: string;
  debug: boolean;
}
export interface OrmSchema {
  default?: any;
  type?: string;
}
export interface RigisterParams {
  tableName: string;
  schema: { [key: string]: OrmSchema };
  createTable: (dbTableName: string) => string;
}

export default class ClickhouseOrm {
  client;
  db;
  debug;
  models={};

  constructor({ client, db, debug }: OrmInitParams) {
    this.client = client;
    this.db = db;
    this.debug = debug;
  }
  createDatabase(){
    Log(`CREATE DATABASE IF NOT EXISTS ${this.db}`);
    return this.client.query(`CREATE DATABASE IF NOT EXISTS ${this.db}`).toPromise();
  }

  /**
   * @remark
   * The createDatabase must be completed 
   */
  async model({ tableName, schema, createTable }: RigisterParams) {
    const dbTableName = `${this.db}.${tableName}`;
    // create table
    const createSql = createTable(dbTableName);
    if(this.debug) DebugLog(`execute model> ${createSql}`);
    await this.client.query(createSql).toPromise();

    const schemaInstance = new Schema(schema)

    const modelInstance = new Model(schemaInstance,  {
      client: this.client,
      dbTableName,
      debug: this.debug,
    });

    this.models[tableName] = modelInstance;
    return modelInstance;
  }
}
