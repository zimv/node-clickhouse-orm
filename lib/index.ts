import Orm, { InitParams } from './orm';
export { setLogService } from './log';// Singleton Pattern
export { VALIDATION_COLUMN_VALUE_TYPE } from './constants';

export const ClickHouseOrm = ({
  client,
  db,
  debug = false
}: InitParams) => {
  const conn = new Orm({ client, db, debug });
  return conn;
}