import { getPureData, insertSQL, object2Sql } from './transformer';
import Schema from './schema';
import { Log, DebugLog } from './log';

/**
 * todo
 * 定义模型需要校验上报内容，不合格内容应该单独不存储，但不影响其他内容存储
 */

export default class ClickHouseOrm {
  client;
  db;
  debug;
  constructor({ client, db, debug }) {
    this.client = client;
    this.db = db;
    this.debug = debug;
  }
  createDatabase(){
    Log(`create database ${this.db}`);
    return this.client.query(`CREATE DATABASE IF NOT EXISTS ${this.db}`).toPromise();
  }
  schemaRegister = async ({ tableName, schema, createTable }) => {
    const dbTableName = `${this.db}.${tableName}`;

    // 如果是远程数据库很可能数据库还没有建立完成，就执行创建表了，这样会报错
    // 创建表
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

    // 初始化模型对象
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
      // getPureData会剔除要求的数据
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
