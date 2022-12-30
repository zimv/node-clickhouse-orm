import { ModelRigisterAndCreateTableParams, InitParams } from "../lib";
import { DATA_TYPE } from "../lib/data-type";

export const initConfig: InitParams = {
  client: {
    url: "localhost",
    port: "8123",
    basicAuth: {
      username: "default",
      password: "",
    },
  },
  db: {
    name: "orm_test",
    engine: "Atomic",
  },
  debug: true,
};

export const initSchema: ModelRigisterAndCreateTableParams = {
  tableName: "test",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
  },
  autoSync: true,
  createTable: (dbTableName) => {
    return `
          CREATE TABLE IF NOT EXISTS ${dbTableName}
          (
            time DateTime,
            status Int32,
            browser LowCardinality(String),
            browser_v String
          )
          ENGINE = MergeTree
          PARTITION BY toYYYYMM(time)
          ORDER BY time`;
  },
};
