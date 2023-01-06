import { DATA_TYPE_DEFINE, FunctionValidation } from "./dataType";
import DataInstance from "./dataInstance";
import { isObject, isObjectDate } from "./utils";
import { ErrorLog } from "./log";

export interface SchemaConfig {
  [key: string]: {
    type: DATA_TYPE_DEFINE;
    default?: any;
  };
}

const errorThrow = ({ column, newVal, columnType }) => {
  const info = `column[${column}]-value(${newVal}): '${columnType}' type validation failed`;
  ErrorLog(info);
  throw new Error(info);
};
export default class Schema {
  // SchemaConfig
  public schemaConfig;
  public columns;

  constructor(schemaConfig: SchemaConfig) {
    this.schemaConfig = schemaConfig;
    this.columns = Object.keys(schemaConfig);

    return this;
  }

  proxyAttr(obj: SchemaConfig, data: DataInstance, column: string) {
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
