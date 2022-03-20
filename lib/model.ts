import { ClickHouse } from "clickhouse";
import { getPureData, insertSQL, object2Sql, SqlObject } from "./transformer";
import Schema, { SchemaTable } from "./schema";
import { DebugLog } from "./log";
import DataInstance from "./dataInstance";

export interface ModelOptions {
  client: ClickHouse;
  dbTableName: string;
  debug: boolean;
  schema: SchemaTable;
}

export default class Model {
  client;
  dbTableName;
  debug;
  schemaInstance: Schema;

  constructor({ client, dbTableName, debug, schema }: ModelOptions) {
    this.client = client;
    this.dbTableName = dbTableName;
    this.debug = debug;

    this.schemaInstance = new Schema(schema);

    return this;
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

  create(obj: Object) {
    // new data model
    const instance = this.build(obj);

    // do save
    return instance.save();
  }

  insertMany(dataArray: Array<Object> | Array<DataInstance>): Promise<any> {
    const datas = [...dataArray].map((item: Object | DataInstance) => {
      let data;
      if (item instanceof DataInstance) {
        data = getPureData(this.schemaInstance.columns, item);
      } else {
        const _data = new DataInstance(this, item);
        data = getPureData(this.schemaInstance.columns, _data);
      }
      return data;
    });

    if (datas && datas.length > 0) {
      const insertHeaders = insertSQL(
        this.dbTableName,
        this.schemaInstance.columns
      );
      if (this.debug)
        DebugLog(
          `[>>EXECUTE INSERTMANY<<] ${insertHeaders} ${JSON.stringify(datas)}`
        );
      return this.client.insert(insertHeaders, datas).toPromise();
    }

    return Promise.resolve({ r: 0 });
  }
}
