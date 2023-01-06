import { ClickHouse } from "clickhouse";
import {
  getPureData,
  insertSQL,
  object2Sql,
  SqlObject,
  deleteObject2Sql,
  DeleteSqlObject,
} from "./transformer";
import Schema, { SchemaConfig } from "./schema";
import { DebugLog } from "./log";
import { DbConfig } from "./orm";
import DataInstance from "./dataInstance";

export interface ModelOptions {
  client: ClickHouse;
  dbTableName: string;
  debug: boolean;
  schema: SchemaConfig;
  db: DbConfig;
}

export default class Model {
  client;
  dbTableName;
  debug;
  db;
  schemaInstance: Schema;

  constructor({ client, dbTableName, debug, schema, db }: ModelOptions) {
    this.client = client;
    this.db = db;
    this.dbTableName = dbTableName;
    this.debug = debug;

    this.schemaInstance = new Schema(schema);
    return this;
  }

  create(obj: Object) {
    // new data model
    const instance = this.build(obj);

    // do save
    return instance.save();
  }

  build(initData?: Object) {
    return new DataInstance(this, initData);
  }

  find(qObjArray: SqlObject[] | SqlObject): Promise<any> {
    if (!Array.isArray(qObjArray)) qObjArray = [qObjArray];
    let sql = "";
    qObjArray.map((qObj, index) => {
      if (index === 0) sql = object2Sql(this.dbTableName, qObj);
      else sql = object2Sql(`(${sql})`, qObj);
    });
    if (this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
    return this.client.query(sql).toPromise();
  }

  delete(deleteObject: DeleteSqlObject): Promise<any> {
    let sql = deleteObject2Sql(this.dbTableName, {
      ...deleteObject,
      cluster: this.db.cluster,
    });
    if (this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
    return this.client.query(sql).toPromise();
  }

  insertMany(dataArray: Array<Object> | Array<DataInstance>): Promise<any> {
    const datas = [...dataArray].map((item: Object | DataInstance) => {
      let data;
      if (item instanceof DataInstance) {
        data = getPureData(this.schemaInstance, item);
      } else {
        const _data = new DataInstance(this, item);
        data = getPureData(this.schemaInstance, _data);
      }
      return data;
    });

    if (datas && datas.length > 0) {
      const insertHeaders = insertSQL(this.dbTableName, this.schemaInstance);
      if (this.debug)
        DebugLog(
          `[>>EXECUTE INSERTMANY<<] ${insertHeaders} ${JSON.stringify(datas)}`
        );
      return this.client.insert(insertHeaders, datas).toPromise();
    }

    return Promise.resolve({ r: 0 });
  }
}
