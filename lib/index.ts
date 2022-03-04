import { ClickHouse } from 'clickhouse';
import Orm, { DbParams } from './orm';
export { setLogService } from './log';// Singleton Pattern
export { DATA_TYPE } from './constants';
import { ErrorLog } from "./log";

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
  // 2.0版本，db 数据结构由 string 改成 object
  // 升级版本有可能创建错误的 undefined 库，以此提示用户注意更新使用方式
  if (!db.name) {
    ErrorLog("Database name is undefined. It should be string");

    return;
  }
  /**
   * new ClickHouse
   */
  return new Orm({ client: new ClickHouse(client), db, debug });
}
