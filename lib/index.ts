import Orm, { InitParams } from './orm';
export * from './constants';

export default ({client, db, debug = false}: InitParams) => {
  const conn = new Orm({ client, db, debug });
  return conn;
}