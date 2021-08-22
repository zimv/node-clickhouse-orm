import { getPureData, insertSQL } from './transformer';
import { DebugLog } from './log';

class dataInstance {
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
    return new dataInstance(this);
  }

  proxyAttr(obj, data, column) {
    let value; //= (data[key] = obj[key].default || '')
    const defaultVal = obj[column].default;
    if (defaultVal) {
      if (defaultVal === Date.now) value = Date.now();
      if (defaultVal === Date) value = new Date();
      else value = defaultVal;
    }
    Object.defineProperty(data, column, {
      enumerable: true,
      get: function () {
        return value;
      },
      set: function (newVal) {
        if (newVal === undefined) return;
        switch (obj[column].type) {
          case String:
            // 如果定义的是字符串类型，却传入了数字或者其他类型
            if (new String(newVal).toString() !== newVal) {
              throw new Error(`column:(${column}) should be a string, the value is: ${newVal}`);
            }
            break;
        }
        value = newVal;
        return newVal;
      },
    });
  }
}
