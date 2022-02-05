import { ClickHouse } from 'clickhouse';
import { getPureData, insertSQL } from './transformer';
import { DATA_TYPE } from './constants';
import { isObject, isObjectDate } from './utils';
import { DebugLog, ErrorLog } from './log';


export class DataInstance {
  private schema;
  constructor(schemaThis: Schema) {
    this.schema = schemaThis;
    this.proxyApply();
  }
  proxyApply() {
    this.schema.columns.forEach((column) => {
      this.schema.proxyAttr(this.schema.obj, this, column);
    });
  }
  save() {
    const data = getPureData(this.schema.columns, this);
    const insertHeaders = insertSQL(this.schema.table, this.schema.columns);
    if(this.schema.debug) DebugLog(`execute save> ${insertHeaders} ${JSON.stringify([data])}`);
    return this.schema.client
      .insert(insertHeaders, [data])
      .toPromise();
  }
}
export interface SchemaObj {
  type?: DATA_TYPE;
  default?: any;
}
export interface SchemaOptions {
  client: ClickHouse;
  table: string;
  debug: boolean;
}

export default class Schema {
  // SchemaObj
  public obj;
  public columns;

  public client;
  public table;
  public debug;

  constructor(schemaObj: SchemaObj) {
    this.obj = schemaObj;
    this.columns = Object.keys(schemaObj);
    return this;
  }
  setOptions({ client, table, debug }: SchemaOptions) {
    this.client = client;
    this.table = table;
    this.debug = debug;
  }

  createModel() {
    return new DataInstance(this);
  }

  proxyAttr(obj: SchemaObj, data: DataInstance, column: string) {
    let value;
    // set default value
    const defaultVal = obj[column].default;
    if (typeof defaultVal !== 'undefined') {
      if (defaultVal === Date.now || defaultVal === Date) value = new Date();
      else value = defaultVal;
    }
    Object.defineProperty(data, column, {
      enumerable: true,
      get: function () {
        return value;
      },
      set: function (newVal) {
        if(obj[column].type){
          const types = obj[column].type.split('|');
          if(types.length){
            const verificationPass = types.filter(type=>{
              // validate value type
              switch (type) {
                case 'boolean':
                  if (typeof newVal === 'boolean') return true;
                  break;
                case 'string':
                  if (typeof newVal === 'string') return true;
                  break;
                case 'number':
                  if (typeof newVal === 'number') return true;
                  break;
                case 'object':
                  if (isObject(newVal)) return true;
                  break;
                case 'date':
                  if (isObjectDate(newVal)) return true;
                  break;
                case 'array':
                  if (Array.isArray(newVal)) return true;
                  break;
              }
              return false;
            })
            if(verificationPass.length === 0){
              const info = `column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type '${obj[column].type}'`;
              ErrorLog(info);
              throw new Error(info);
            }
          }
        }
        value = newVal;
        return newVal;
      },
    });
  }
}
