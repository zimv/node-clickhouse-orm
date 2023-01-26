import {
  ClickhouseOrm,
  setLogService,
  ModelSyncTableConfig,
  ModelConfig,
  ModelSqlCreateTableConfig,
  DATA_TYPE
} from "../lib";

import { initConfig, modelSqlCreateTableConfig } from "../mock/index";

// integration test
describe("test whole flow", () => {
  let orm;
  beforeEach(() => {
    setLogService(console.warn);
    orm = ClickhouseOrm(initConfig);
  });

  /** ts test */
  const tsTestModelConfig: ModelConfig<{
    status?: number;
    time: Date;
    browser?: string;
    browser_v?: string;
  }> = {
    tableName: "table1",
    schema: {
      time: { type: DATA_TYPE.DateTime, default: Date },
      status: { type: DATA_TYPE.Int32 },
      browser: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
      browser_v: { type: DATA_TYPE.String },
    },
  };
  const tsTestModelSyncTableConfig: ModelSyncTableConfig<{
    status?: number;
    time: Date;
    browser?: string;
    browser_v?: string;
  }> = {
    tableName: "table1",
    schema: {
      time: { type: DATA_TYPE.DateTime, default: Date },
      status: { type: DATA_TYPE.Int32 },
      browser: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
      browser_v: { type: DATA_TYPE.String },
    },
    options: `ENGINE = MergeTree
    PARTITION BY toYYYYMM(time)
    ORDER BY time`,
    autoCreate: true,
    autoSync: true,
  };
  const tsModelSqlCreateTableConfig: ModelSqlCreateTableConfig<{
    status?: number;
    time: Date;
    browser?: string;
    browser_v?: string;
  }> = {
    tableName: "table1",
    schema: {
      time: { type: DATA_TYPE.DateTime, default: Date },
      status: { type: DATA_TYPE.Int32 },
      browser: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
      browser_v: { type: DATA_TYPE.String },
    },
    createTable: (dbTableName, db) => dbTableName
  };


  test("insert data and find success", async () => {
    const model = await orm.model(modelSqlCreateTableConfig);

    const data = model.build({
      status: 1,
    });
    data.time = new Date();
    data.browser = "chrome";
    data.browser_v = "90.0.1.21";
    await data.save();

    await model.create({
      status: 2,
      time: new Date(),
      browser: "safari",
      browser_v: "90.0.1.21",
    });

    await model.insertMany([
      {
        status: 3,
        time: new Date(),
        browser: "baidu",
        browser_v: "90.0.1.21",
      },
      {
        status: 4,
        time: new Date(),
        browser: "firefox",
        browser_v: "90.0.1.21",
      },
    ]);

    const res = await model.find({ select: "*", limit: 2 });

    expect(res.length).toBeLessThanOrEqual(2);
  });

  test("validate db config", async () => {
    const config1 = { ...initConfig, db: { ...initConfig.db } };
    const config2 = { ...initConfig, db: { ...initConfig.db } };
    delete config1.db.name;
    delete config2.db;
    expect(ClickhouseOrm(config1)).toBeUndefined();
    expect(ClickhouseOrm(config2)).toBeUndefined();
  });
});
