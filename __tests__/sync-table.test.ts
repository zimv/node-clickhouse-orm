import { ClickhouseOrm } from "../lib";
import * as Log from "../lib/log";

import {
  initConfig,
  modelSyncTableParams1,
  modelSyncTableParams2,
} from "../mock/index";

describe("Sync table test", () => {
  let orm;
  beforeAll(async () => {
    orm = ClickhouseOrm(initConfig);
    await orm.createDatabase();
    // delete olb table
    return orm.client
      .query(
        `DROP TABLE IF EXISTS ${initConfig.db.name}.${modelSyncTableParams1.tableName}`
      )
      .toPromise();
  });

  test("sync table `autoCreateTableSql()` and `syncTable()`", async () => {
    const autoCreateTableSqlMock = jest.spyOn(orm, "autoCreateTableSql");
    const syncTableMock = jest.spyOn(orm, "syncTable");
    await orm.model(modelSyncTableParams1);
    await orm.model(modelSyncTableParams2);
    expect(autoCreateTableSqlMock).toHaveBeenCalled();
    expect(syncTableMock).toHaveBeenCalled();
  });
});
