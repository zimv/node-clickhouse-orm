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
import {
  ClickhouseClientInsertPromise,
  ClickhouseClientToPromise,
} from "./constants";

export interface ModelOptions {
  client: ClickHouse;
  dbTableName: string;
  debug: boolean;
  schema: SchemaConfig;
  db: DbConfig;
}

export default class Model<T = any> {
  client;
  dbTableName;
  debug;
  db;
  schemaInstance: Schema;
  schema: SchemaConfig;

  constructor({ client, dbTableName, debug, schema, db }: ModelOptions) {
    this.client = client;
    this.db = db;
    this.dbTableName = dbTableName;
    this.debug = debug;

    this.schemaInstance = new Schema(schema);
    return this;
  }

  create(data: T): ClickhouseClientInsertPromise {
    // new data model
    const instance = new DataInstance(this, data);

    // do save
    return instance.save();
  }

  build(initData?: Partial<T>) {
    return new DataInstance(this, initData) as DataInstance & Partial<T>;
  }

  find(qObjArray: SqlObject[] | SqlObject): ClickhouseClientToPromise {
    if (!Array.isArray(qObjArray)) qObjArray = [qObjArray];
    let sql = "";
    qObjArray.map((qObj, index) => {
      if (index === 0) sql = object2Sql(this.dbTableName, qObj);
      else sql = object2Sql(`(${sql})`, qObj);
    });
    if (this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
    return this.client.query(sql).toPromise();
  }

  delete(deleteObject: DeleteSqlObject): ClickhouseClientToPromise {
    let sql = deleteObject2Sql(this.dbTableName, {
      ...deleteObject,
      cluster: this.db.cluster,
    });
    if (this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
    return this.client.query(sql).toPromise();
  }

  insertMany(
    dataArray: Array<T> | Array<DataInstance & T>
  ): ClickhouseClientInsertPromise {
    const datas = [...dataArray].map((item: T | (DataInstance & T)) => {
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
  }
}
