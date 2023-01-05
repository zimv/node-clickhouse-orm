export type FunctionValidation = (...value: any) => boolean;
interface DataTypeValidation {
  [key: string]: string | FunctionValidation;
  ['FixedString']: FunctionValidation;
}
// Validate Data Type when INSERT INTO
export const dataTypeValidation: DataTypeValidation = {
  UInt8: "number",
  UInt16: "number",
  UInt32: "number",
  UInt64: "number",
  UInt128: "number",
  UInt256: "number",
  Int8: "number",
  Int16: "number",
  Int32: "number",
  Int64: "number",
  Int128: "number",
  Int256: "number",
  Float32: "number",
  Float64: "number",
  Boolean: "boolean",
  String: "string",
  UUID: "string",
  Date: "date|string|number",
  Date32: "date|string|number",
  DateTime: "date|string|number",
  DateTime64: "date|string|number",
  Enum: 'string',
  Enum8: 'string',
  Enum16: 'string',
  FixedString(value, N) {
    if (value.length > N) return false;
    return true;
  },
};
