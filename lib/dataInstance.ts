import { getPureData, insertSQL } from "./transformer";
import { ErrorLog, DebugLog } from "./log";
import { isObject } from "./utils";
import Model from "./model";

export default class DataInstance {
  [key: string]: any;
  private model;
  constructor(model: Model, initData?: Object) {
    this.model = model;
    this.proxyApply();
    initData && isObject(initData) && this.setInitData(initData);
  }
  private setInitData(initData: Object) {
    Object.keys(initData).forEach((column: string) => {
      if (this.checkColumnExist(column)) this[column] = initData[column];
    });
  }
  private checkColumnExist(column) {
    if (this.model.schemaInstance.columns.indexOf(column) === -1) {
      ErrorLog(
        `'${column}' is not a column of '${
          this.model.dbTableName
        }'. It should include ${this.model.schemaInstance.columns.join("、")}`
      );
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
    const insertHeaders = insertSQL(
      this.model.dbTableName,
      schemaInstance.columns
    );
    if (this.model.debug)
      DebugLog(`execute save> ${insertHeaders} ${JSON.stringify([data])}`);
    return this.model.client.insert(insertHeaders, [data]).toPromise();
  }
}
