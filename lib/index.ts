import { ClickHouse } from 'clickhouse';
import Orm from './orm';
export { setLogService } from './log';// Singleton Pattern
export { DATA_TYPE } from './constants';

export interface InitParams {
  client: Object;// TimonKK/clickhouse config
  db: string;
  debug: boolean;
}

export const ClickhouseOrm = ({
  client,
  db,
  debug = false
}: InitParams) => {
  /**
   * new ClickHouse
   */
  const conn = new Orm({ client: new ClickHouse(client), db, debug });
  return conn;
}