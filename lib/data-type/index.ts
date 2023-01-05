import { dataTypeValidation, FunctionValidation } from "./validation";
export { FunctionValidation } from "./validation";
export type DATA_TYPE_DEFINE = {
  validation?: string | FunctionValidation;
  columnType: string;
};
export type DATA_TYPE_FUNCTION_DEFINE = (...arg: any) => DATA_TYPE_DEFINE;

export interface I_DATA_TYPES {
  UInt8: DATA_TYPE_DEFINE;
  UInt16: DATA_TYPE_DEFINE;
  UInt32: DATA_TYPE_DEFINE;
  UInt64: DATA_TYPE_DEFINE;
  UInt128: DATA_TYPE_DEFINE;
  UInt256: DATA_TYPE_DEFINE;
  Int8: DATA_TYPE_DEFINE;
  Int16: DATA_TYPE_DEFINE;
  Int32: DATA_TYPE_DEFINE;
  Int64: DATA_TYPE_DEFINE;
  Int128: DATA_TYPE_DEFINE;
  Int256: DATA_TYPE_DEFINE;
  Float32: DATA_TYPE_DEFINE;
  Float64: DATA_TYPE_DEFINE;
  Boolean: DATA_TYPE_DEFINE;
  String: DATA_TYPE_DEFINE;
  UUID: DATA_TYPE_DEFINE;
  Date: DATA_TYPE_DEFINE;
  Date32: DATA_TYPE_DEFINE;
  DateTime: DATA_TYPE_DEFINE;
  DateTime64: DATA_TYPE_DEFINE;
  FixedString: DATA_TYPE_FUNCTION_DEFINE;
  LowCardinality: DATA_TYPE_FUNCTION_DEFINE;
  Enum: DATA_TYPE_FUNCTION_DEFINE;
  Enum8: DATA_TYPE_FUNCTION_DEFINE;
  Enum16: DATA_TYPE_FUNCTION_DEFINE;
}
// Data Type
export const DATA_TYPE: I_DATA_TYPES = {
  UInt8: {
    validation: dataTypeValidation.UInt8,
    columnType: "UInt8",
  },
  UInt16: {
    validation: dataTypeValidation.UInt16,
    columnType: "UInt16",
  },
  UInt32: {
    validation: dataTypeValidation.UInt32,
    columnType: "UInt32",
  },
  UInt64: {
    validation: dataTypeValidation.UInt64,
    columnType: "UInt64",
  },
  UInt128: {
    validation: dataTypeValidation.UInt128,
    columnType: "UInt128",
  },
  UInt256: {
    validation: dataTypeValidation.UInt256,
    columnType: "UInt256",
  },
  Int8: {
    validation: dataTypeValidation.Int8,
    columnType: "Int8",
  },
  Int16: {
    validation: dataTypeValidation.Int16,
    columnType: "Int16",
  },
  Int32: {
    validation: dataTypeValidation.Int32,
    columnType: "Int32",
  },
  Int64: {
    validation: dataTypeValidation.Int64,
    columnType: "Int64",
  },
  Int128: {
    validation: dataTypeValidation.Int128,
    columnType: "Int128",
  },
  Int256: {
    validation: dataTypeValidation.Int256,
    columnType: "Int256",
  },
  Float32: {
    validation: dataTypeValidation.Float32,
    columnType: "Float32",
  },
  Float64: {
    validation: dataTypeValidation.Float64,
    columnType: "Float64",
  },
  Boolean: {
    validation: dataTypeValidation.Boolean,
    columnType: "Boolean",
  },
  String: {
    validation: dataTypeValidation.String,
    columnType: "String",
  },
  UUID: {
    validation: dataTypeValidation.UUID,
    columnType: "UUID",
  },
  Date: {
    validation: dataTypeValidation.Date,
    columnType: "Date",
  },
  Date32: {
    validation: dataTypeValidation.Date32,
    columnType: "Date32",
  },
  DateTime: {
    validation: dataTypeValidation.DateTime,
    columnType: "DateTime",
  },
  DateTime64: {
    validation: dataTypeValidation.DateTime64,
    columnType: "DateTime64",
  },
  FixedString: (N: number) => {
    return {
      validation: (value: string) => dataTypeValidation.FixedString(value, N),
      columnType: `FixedString(${N})`,
    };
  },
  LowCardinality: (type: DATA_TYPE_DEFINE) => {
    return {
      validation: type.validation,
      columnType: `LowCardinality(${type.columnType})`,
    };
  },
  Enum: (enums: string) => {
    return {
      validation: dataTypeValidation.Enum,
      columnType: `Enum(${enums})`,
    };
  },
  Enum8: (enums: string) => {
    return {
      validation: dataTypeValidation.Enum8,
      columnType: `Enum8(${enums})`,
    };
  },
  Enum16: (enums: string) => {
    return {
      validation: dataTypeValidation.Enum16,
      columnType: `Enum16(${enums})`,
    };
  },
};
