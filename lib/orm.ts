import { ClickHouse } from 'clickhouse';
import { getPureData, insertSQL, object2Sql, SqlObject } from './transformer';
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
  models;
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
  registerSchema = async ({ tableName, schema, createTable }: RigisterParams) => {
    const dbTableName = `${this.db}.${tableName}`;

    // create table
    const createSql = createTable(dbTableName);
    if(this.debug) DebugLog(`execute registerSchema> ${createSql}`);
    await this.client.query(createSql).toPromise();
    this.models[tableName] = this.model(dbTableName, new Schema(schema));

    return this.models[tableName];
  };

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
    instanceModel.find = (qObjArray: SqlObject[] | SqlObject) => {
      if(!Array.isArray(qObjArray)) qObjArray = [qObjArray];
      let sql = '';
      qObjArray.map((qObj, index)=>{
        if(index === 0) sql = object2Sql(table, qObj);
        else sql = object2Sql(`(${sql})`, qObj);
      })
      if(this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
      return client.query(sql).toPromise();
    };
    // save list
    instanceModel.insertMany = (dataArray) => {
      const datas = dataArray.map((item) => {
        return getPureData(schema.columns, item);
      });
      if (datas && datas.length > 0) {
        const insertHeaders = insertSQL(schema.table, schema.columns);
        if(this.debug) DebugLog(`[>>EXECUTE INSERTMANY<<] ${insertHeaders} ${JSON.stringify(datas)}`);
        return client
          .insert(insertHeaders, datas)
          .toPromise();
      }
    };

    // save
    instanceModel.insert = (obj) => {
      const model = this.models[schema.table];
      // new data model
      const data = model();

      Object.keys(obj).forEach((i) => {
        data[i] = obj[i];
      });

      // do save
      return data.save();
    };

    return instanceModel;
  }
}
