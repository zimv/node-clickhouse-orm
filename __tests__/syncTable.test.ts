import { ClickhouseOrm } from "../lib";

import {
  initConfig,
  modelSyncTableConfig1,
  modelSyncTableConfig2,
  modelSyncTableConfig3,
} from "../mock/index";

describe("Sync table test", () => {
  let orm, orm2;
  beforeAll(async () => {
    orm = ClickhouseOrm(initConfig);
    orm2 = ClickhouseOrm(initConfig);
    await orm.createDatabase();
    // delete old table
    await orm.client
    .query(
      `DROP TABLE IF EXISTS ${initConfig.db.name}.${modelSyncTableConfig3.tableName}`
    )
    .toPromise();
    return orm.client
      .query(
        `DROP TABLE IF EXISTS ${initConfig.db.name}.${modelSyncTableConfig1.tableName}`
      )
      .toPromise();
  });

  test("sync table `autoCreateTableSql()` and `syncTable()`", async () => {
    const autoCreateTableSqlMock = jest.spyOn(orm, "autoCreateTableSql");
    const syncTableMock = jest.spyOn(orm, "syncTable");
    await orm.model(modelSyncTableConfig1);
    await orm.model(modelSyncTableConfig2);
    expect(autoCreateTableSqlMock).toHaveBeenCalled();
    expect(syncTableMock).toHaveBeenCalled();
  });

  test("not sync table", async () => {
    const autoCreateTableSqlMock = jest.spyOn(orm2, "autoCreateTableSql");
    const syncTableMock = jest.spyOn(orm2, "syncTable");
    await orm2.model(modelSyncTableConfig3);
    await orm2.model(modelSyncTableConfig3);
    expect(autoCreateTableSqlMock).toHaveBeenCalled();
    expect(syncTableMock).not.toHaveBeenCalled();
  });
});
