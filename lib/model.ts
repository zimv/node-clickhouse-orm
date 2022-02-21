import { ClickHouse } from 'clickhouse';
import { getPureData, insertSQL, object2Sql, SqlObject } from './transformer';
import Schema from './schema';
import { ErrorLog, DebugLog } from './log';
import { isObject } from './utils';

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

export interface ModelOptions {
  client: ClickHouse;
  dbTableName: string;
  debug: boolean;
}

export class DataInstance {
  [key:string]: any;
  private model;
  constructor(model: Model, initData?: Object) {
    this.model = model;
    this.proxyApply();
    initData && isObject(initData) && this.setInitData(initData);
  }
  private setInitData(initData: Object) {
    Object.keys(initData).forEach((column: string) => {
      if(this.checkColumnExist(column)) this[column] = initData[column];
    });
  }
  private checkColumnExist(column) {
    if(this.model.schemaInstance.columns.indexOf(column) === -1) {
      ErrorLog(`'${column}' is not a column of '${this.model.dbTableName}'. It should include ${this.model.schemaInstance.columns.join('、')}`);
      return false;
    }
    return true;
  }
  private proxyApply() {
    const schemaInstance = this.model.schemaInstance;
    schemaInstance.columns.forEach((column: string) => {
      schemaInstance.proxyAttr(schemaInstance.obj, this, column);
    });
  }
  save(): Promise<any> {
    const schemaInstance = this.model.schemaInstance;
    const data = getPureData(schemaInstance.columns, this);
    const insertHeaders = insertSQL(this.model.dbTableName, schemaInstance.columns);
    if(this.model.debug) DebugLog(`execute save> ${insertHeaders} ${JSON.stringify([data])}`);
    return this.model.client
      .insert(insertHeaders, [data])
      .toPromise();
  }
}

export default class Model {

  client;
  dbTableName;
  debug;
  schemaInstance: Schema;

  constructor(schemaInstance: Schema, { client, dbTableName, debug }: ModelOptions) {

    this.client = client;
    this.dbTableName = dbTableName;
    this.debug = debug;

    this.schemaInstance = schemaInstance;

    return this;
  }

  build(initData?:Object) {
    return new DataInstance(this, initData);
  }

  find(qObjArray: SqlObject[] | SqlObject): Promise<any> {
    if(!Array.isArray(qObjArray)) qObjArray = [qObjArray];
    let sql = '';
    qObjArray.map((qObj, index)=>{
      if(index === 0) sql = object2Sql(this.dbTableName, qObj);
      else sql = object2Sql(`(${sql})`, qObj);
    })
    if(this.debug) DebugLog(`[>>EXECUTE FIND<<] ${sql}`);
    return this.client.query(sql).toPromise();
  };

  create(obj: Object) {
    // new data model
    const instance = this.build();

    Object.keys(obj).forEach((i) => {
      instance[i] = obj[i];
    });

    // do save
    return instance.save();
  }

  insertMany(dataArray: Array<Object>|Array<DataInstance>): Promise<any> {

    const datas = [...dataArray].map((item: Object|DataInstance) => {
      if (item instanceof DataInstance) {
        return getPureData(this.schemaInstance.columns, item);
      }else{
        const data = new DataInstance(this,);
        Object.keys(item).forEach((column: string) => {
          data[column] = item[column];
        });
        return getPureData(this.schemaInstance.columns, data);
      }
    })

    if (datas && datas.length > 0) {
      const insertHeaders = insertSQL(this.dbTableName, this.schemaInstance.columns);
      if(this.debug) DebugLog(`[>>EXECUTE INSERTMANY<<] ${insertHeaders} ${JSON.stringify(datas)}`);
      return this.client
        .insert(insertHeaders, datas)
        .toPromise();
    }

    return Promise.resolve({ r: 0 });
  }
}
