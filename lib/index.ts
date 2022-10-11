import { ClickHouse } from 'clickhouse';
import Orm, { DbParams } from './orm';
import { ErrorLog } from "./log";
export { setLogService } from './log';// Singleton Pattern
export { DATA_TYPE } from './constants';
export * from './orm';
export interface InitParams {
  client: Object;// TimonKK/clickhouse config
  db: DbParams;
  debug: boolean;
}

export const ClickhouseOrm = ({
  client,
  db,
  debug = false
}: InitParams) => {
  if(!db) {
    ErrorLog("db is undefined. It should be object that include required name and optional engine");
    return;
  }

  if (!db.name) {
    ErrorLog("db.name is undefined. db is object and db.name should be string");
    return;
  }
  /**
   * new ClickHouse
   */
  return new Orm({ client: new ClickHouse(client), db, debug });
}
