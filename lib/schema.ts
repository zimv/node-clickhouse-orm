import { getPureData, insertSQL } from './transformer';
import { isObject } from './utils';
import { DebugLog } from './log';

class DataInstance {
  private schema;
  constructor(schemaThis) {
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

export default class Schema {
  public obj;
  public columns;

  public client;
  public table;
  public debug;

  constructor(obj) {
    this.obj = obj;
    this.columns = Object.keys(obj);
    return this;
  }
  setOptions({ client, table, debug }) {
    this.client = client;
    this.table = table;
    this.debug = debug;
  }

  createModel() {
    return new DataInstance(this);
  }

  proxyAttr(obj, data, column) {
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
        // validate value type
        switch (obj[column].type) {
          case 'boolean':
            if (typeof newVal !== 'boolean') {
              throw new Error(`column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type 'boolean'`);
            }
            break;
          case 'string':
            if (typeof newVal !== 'string') {
              throw new Error(`column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type 'string'`);
            }
            break;
          case 'number':
            if (typeof newVal !== 'number') {
              throw new Error(`column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type 'number'`);
            }
            break;
          case 'object':
              if (isObject(newVal)) {
                throw new Error(`column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type 'object'`);
              }
              break;
          case 'array':
            if (Array.isArray(newVal)) {
              throw new Error(`column[${column}]-value(${newVal}): Type '${typeof newVal}' is not assignable to type 'array'`);
            }
            break;
        }
        value = newVal;
        return newVal;
      },
    });
  }
}
