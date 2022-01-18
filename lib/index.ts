import Orm, { InitParams } from './orm';
import { setLogService } from './log';// Singleton Pattern
export * from './constants';

export default ({client, db, logService, debug = false}: InitParams) => {
  if(logService && typeof logService === 'function') setLogService(logService);
  const conn = new Orm({ client, db, debug });
  return conn;
}