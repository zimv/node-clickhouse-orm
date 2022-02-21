import { ClickHouse } from 'clickhouse';
import Model from './model';
import Schema from './schema';
import { Log, DebugLog } from './log';

export interface DbParams {
  name: string;
  engine?: string; // default: Atomic
}
export interface OrmInitParams {
  client: ClickHouse;
  db: DbParams;
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
  client: ClickHouse;
  db: DbParams;
  debug: boolean;
  models={};

  constructor({ client, db, debug }: OrmInitParams) {
    this.client = client;
    this.db = db;
    this.debug = debug;
  }
  createDatabase(){
    const { name, engine } = this.db;
    const createDatabaseSql = 
      `CREATE DATABASE IF NOT EXISTS ${name} ${engine ? `ENGINE=${engine}` : ''}`;
    Log(createDatabaseSql);
    return this.client.query(createDatabaseSql).toPromise();
  }

  /**
   * @remark
   * The createDatabase must be completed 
   */
  async model({ tableName, schema, createTable }: RigisterParams) {
    const dbTableName = `${this.db.name}.${tableName}`;
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
