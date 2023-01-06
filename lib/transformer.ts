import DataInstance from "./dataInstance";
import { DATA_TYPE } from "./dataType";
import Schema from "./schema";

// If database auto set value need to remove column
const DbAutoSetValueDataTypeFilter = [];
/**
 * Get a pure data instead of a model instance
 */
export const getPureData = (
  schemaInstance: Schema,
  dataInstance: DataInstance
) => {
  const data = {};
  schemaInstance.columns.forEach((key) => {
    if (DbAutoSetValueDataTypeFilter.includes(schemaInstance.schemaConfig[key].type)) return;
    data[key] = dataInstance[key] != undefined ? dataInstance[key] : null;
  });
  return data;
};

export const insertSQL = (tableName: string, schemaInstance: Schema) => {
  const headers = schemaInstance.columns.filter(
    (key) => !DbAutoSetValueDataTypeFilter.includes(schemaInstance.schemaConfig[key].type)
  );
  return `INSERT INTO ${tableName} (${headers.join(",")})`;
};

export interface SqlObject {
  select?: string;
  where?: string;
  limit?: number;
  skip?: number;
  orderBy?: string;
  groupBy?: string;
}
// table: tableName or parentSql
export const object2Sql = (table: string, qObj: SqlObject) => {
  const { select = "*", where, limit, skip = 0, orderBy, groupBy } = qObj;
  let _where = "",
    _limit = "",
    _orderBy = "",
    _groupBy = "";

  if (where) {
    _where = ` WHERE ${where}`;
  }

  if (limit) {
    _limit = ` LIMIT ${skip ? `${skip},` : ""}${limit}`;
  }

  if (orderBy) {
    _orderBy = ` ORDER BY ${orderBy}`;
  }

  if (groupBy) {
    _groupBy = ` GROUP BY ${groupBy}`;
  }

  return `SELECT ${select} from ${table}${_where}${_groupBy}${_orderBy}${_limit}`;
};

export const getClusterStr = (cluster: string) => {
  return cluster ? `ON CLUSTER ${cluster}` : "";
};
export const getDatabaseEngineStr = (engine: string) => {
  return engine ? `ENGINE=${engine}` : "";
};
export interface DeleteSqlObject {
  where: string;
}
// table: tableName or parentSql
export const deleteObject2Sql = (
  table: string,
  qObj: DeleteSqlObject & {
    cluster?: string;
  }
) => {
  const { where, cluster } = qObj;
  let _where = "";

  if (where) {
    _where = ` WHERE ${where}`;
  }

  return `ALTER TABLE ${table} ${getClusterStr(cluster)} DELETE ${_where}`;
};
