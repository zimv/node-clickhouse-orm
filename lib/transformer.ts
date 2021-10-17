/**
 * Get a pure data instead of a model instance
 */
export const getPureData = (keys, schemaInstance) => {
  const data = {};
  keys.forEach((key) => {
    data[key] = schemaInstance[key] != undefined ? schemaInstance[key] : null;
  });
  return data;
};

export const insertSQL = (table, keys) => {
  return `INSERT INTO ${table} (${keys.join(',')})`;
};

// table: tableName or parentSql
export const object2Sql = (table, qObj) => {
  if(!qObj) qObj = {};
  const {
    cols = '*',
    where,
    limit,
    skip = 0,
    orderBy,
    groupBy
  } = qObj;
  let _limit = '', _orderBy = '', _groupBy = '';
  if(limit){
    _limit = `LIMIT ${skip ? `${skip},`: ''}${limit}`
  } 
  if(orderBy){
    _orderBy = `ORDER BY ${orderBy}`
  }
  if(groupBy){
    _groupBy = `GROUP BY ${groupBy}`
  }
  return `SELECT ${cols} from ${table} ${where ? 'where ' + where : ''} ${_groupBy} ${_orderBy} ${_limit}`;
};