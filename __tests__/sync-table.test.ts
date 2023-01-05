import { ClickhouseOrm, DATA_TYPE } from "../lib";

import {
  initConfig,
  modelSyncTableParams1,
  modelSyncTableParams2,
  modelSyncTableParams3,
} from "../mock/index";

describe("Sync table test", () => {
  let orm, orm2;
  beforeAll(async () => {
    orm = ClickhouseOrm(initConfig);
    orm2 = ClickhouseOrm(initConfig);
    await orm.createDatabase();
    // delete olb table
    await orm.client
    .query(
      `DROP TABLE IF EXISTS ${initConfig.db.name}.${modelSyncTableParams3.tableName}`
    )
    .toPromise();
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

  test("not sync table", async () => {
    const autoCreateTableSqlMock = jest.spyOn(orm2, "autoCreateTableSql");
    const syncTableMock = jest.spyOn(orm2, "syncTable");
    await orm2.model(modelSyncTableParams3);
    await orm2.model(modelSyncTableParams3);
    expect(autoCreateTableSqlMock).toHaveBeenCalled();
    expect(syncTableMock).not.toHaveBeenCalled();
  });
});
