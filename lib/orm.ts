import { ClickHouse } from 'clickhouse';
import { getPureData, insertSQL, object2Sql } from './transformer';
import Schema from './schema';
import { Log, DebugLog } from './log';

export interface InitParams {
  client: ClickHouse;
  db: string;
  debug: boolean;
  logService?: ()=>void;
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

export default class ClickHouseOrm {
  client;
  db;
  debug;
  constructor({ client, db, debug }: InitParams) {
    this.client = client;
    this.db = db;
    this.debug = debug;
  }
  createDatabase(){
    Log(`create database ${this.db}`);
    return this.client.query(`CREATE DATABASE IF NOT EXISTS ${this.db}`).toPromise();
  }

  /**
   * @remark
   * The createDatabase must be completed 
   */
  schemaRegister = async ({ tableName, schema, createTable }: RigisterParams) => {
    const dbTableName = `${this.db}.${tableName}`;

    // create table
    const createSql = createTable(dbTableName);
    if(this.debug) DebugLog(`execute schemaRegister> ${createSql}`);
    await this.client.query(createSql).toPromise();
    return this.model(dbTableName, new Schema(schema));
  }
  model(tableName, schema) {
    const table = tableName;
    const client = this.client;
    schema.setOptions({
      client,
      table,
      debug: this.debug,
    });

    function instanceModel() {
      const data = schema.createModel();
      return data;
    }
    instanceModel.find = function (qObjArray) {
      if(!Array.isArray(qObjArray)) qObjArray = [qObjArray];
      let sql = '';
      qObjArray.map((qObj, index)=>{
        if(index === 0) sql = object2Sql(table, qObj);
        else sql = object2Sql(`(${sql})`, qObj);
      })
      if(this.debug) DebugLog(`execute find> ${sql}`);
      return client.query(sql).toPromise();
    };
    instanceModel.insertMany = function (dataArray) {
      const datas = dataArray.map((item) => {
        return getPureData(schema.columns, item);
      });
      if (datas && datas.length > 0) {
        const insertHeaders = insertSQL(schema.table, schema.columns);
        if(this.debug) DebugLog(`execute insertMany> ${insertHeaders} ${JSON.stringify(datas)}`);
        return client
          .insert(insertHeaders, datas)
          .toPromise();
      }
    };
    return instanceModel;
  }
}
