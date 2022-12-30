import { DATA_TYPE_DEFINE, FunctionValidation } from "./data-type";
import DataInstance from "./dataInstance";
import { isObject, isObjectDate } from "./utils";
import { ErrorLog, Log } from "./log";

export interface SchemaTable {
  [key: string]: SchemaObj;
}

export interface SchemaObj {
  type: DATA_TYPE_DEFINE;
  default?: any;
}

const errorThrow = ({ column, newVal, columnType }) => {
  const info = `column[${column}]-value(${newVal}): '${columnType}' type validation failed`;
  ErrorLog(info);
  throw new Error(info);
};
export default class Schema {
  // SchemaObj
  public obj;
  public columns;

  constructor(schemaObj: SchemaTable) {
    this.obj = schemaObj;
    this.columns = Object.keys(schemaObj);

    return this;
  }

  proxyAttr(obj: SchemaTable, data: DataInstance, column: string) {
    let value;
    // set default value
    const defaultVal = obj[column].default;
    if (typeof defaultVal !== "undefined") {
      if (defaultVal === Date.now || defaultVal === Date) value = new Date();
      else value = defaultVal;
    }
    Object.defineProperty(data, column, {
      enumerable: true,
      get: function () {
        return value;
      },
      set: function (newVal) {
        if (obj[column].type && obj[column].type.validation) {
          // basic type validation
          if (typeof obj[column].type.validation === "string") {
            const validation = obj[column].type.validation as string;
            const types = validation.split("|");
            if (types.length) {
              const verificationPass = types.filter((type) => {
                // validate value type
                switch (type) {
                  case "boolean":
                    if (typeof newVal === "boolean") return true;
                    break;
                  case "string":
                    if (typeof newVal === "string") return true;
                    break;
                  case "number":
                    if (typeof newVal === "number") return true;
                    break;
                  case "object":
                    if (isObject(newVal)) return true;
                    break;
                  case "date":
                    if (isObjectDate(newVal)) return true;
                    break;
                  case "array":
                    if (Array.isArray(newVal)) return true;
                    break;
                }
                return false;
              });
              if (verificationPass.length === 0) {
                errorThrow({
                  column,
                  newVal,
                  columnType: obj[column].type.columnType,
                });
              }
            }
          }
          // validation function
          else if (typeof obj[column].type.validation === "function") {
            const validation = obj[column].type
              .validation as FunctionValidation;
            if (!validation(newVal)) {
              errorThrow({
                column,
                newVal,
                columnType: obj[column].type.columnType,
              });
            }
          }
        }
        value = newVal;
        return newVal;
      },
    });
  }
}
