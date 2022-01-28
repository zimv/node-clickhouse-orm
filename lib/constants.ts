export const CLICKHOUSE_ORM_DEBUG = 'clickhouse-orm-debug: ';
export const CLICKHOUSE_ORM_LOG = 'clickhouse-orm-log: ';

// validate data type
export enum VALIDATION_COLUMN_VALUE_TYPE {
  UInt8 = 'number',
  UInt16 = 'number',
  UInt32 = 'number',
  UInt64 = 'number',
  UInt128 = 'number',
  UInt256 = 'number',
  Int8 = 'number',
  Int16 = 'number',
  Int32 = 'number',
  Int64 = 'number',
  Int128 = 'number',
  Int256 = 'number',
  Float32 = 'number',
  Float64 = 'number',
  Boolean = 'boolean',
  String = 'string',
  UUID = 'string',
  Date = 'object',
  Date32 = 'object',
  DateTime = 'object',
  DateTime64 = 'object',
  Enum = 'object',
}