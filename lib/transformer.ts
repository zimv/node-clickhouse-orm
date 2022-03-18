import DataInstance from "./dataInstance";
/**
 * Get a pure data instead of a model instance
 */
export const getPureData = (keys: string[], dataInstance: DataInstance) => {
  const data = {};
  keys.forEach((key) => {
    data[key] = dataInstance[key] != undefined ? dataInstance[key] : null;
  });
  return data;
};

export const insertSQL = (table: string, keys: string[]) => {
  return `INSERT INTO ${table} (${keys.join(",")})`;
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
    _where = ` where ${where}`;
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
