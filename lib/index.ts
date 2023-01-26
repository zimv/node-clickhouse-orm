import { ClickHouse } from "clickhouse";
import Orm, { OrmConfig } from "./orm";
import { ErrorLog } from "./log";
export { setLogService } from "./log"; // Singleton Pattern
export { DATA_TYPE } from "./dataType";
export * from "./orm";
export { default as ClickHouseORM } from "./orm";
export { default as ClickhouseOrmModel } from "./model";

export const ClickhouseOrm = ({ client, db, debug = false }: OrmConfig) => {
  if (!db) {
    ErrorLog(
      "db is undefined. It should be object that include required name and optional engine"
    );
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
};
