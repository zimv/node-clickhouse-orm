import {
  InitParams,
  ModelSqlCreateTableParams,
  ModelSyncTableParams,
} from "../lib";
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

export const modelSqlCreateTableParams: ModelSqlCreateTableParams = {
  tableName: "test",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
  },
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

export const modelSyncTableParams1: ModelSyncTableParams = {
  tableName: "testsync",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int16 },
    will_deleted: { type: DATA_TYPE.String },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};

export const modelSyncTableParams2: ModelSyncTableParams = {
  tableName: "testsync",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int32 },
    add_column: { type: DATA_TYPE.String },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};