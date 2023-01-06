import {
  OrmConfig,
  ModelSqlCreateTableConfig,
  ModelSyncTableConfig,
} from "../lib";
import { DATA_TYPE } from "../lib/dataType";

export const clientConfig = {
  url: "localhost",
  port: "8123",
  basicAuth: {
    username: "default",
    password: "",
  },
};

export const initConfig: OrmConfig = {
  client: clientConfig,
  db: {
    name: "orm_test",
    engine: "Atomic",
  },
  debug: true,
};

export const modelSqlCreateTableConfig: ModelSqlCreateTableConfig = {
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

export const modelSyncTableConfig1: ModelSyncTableConfig = {
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

export const modelSyncTableConfig2: ModelSyncTableConfig = {
  ...modelSyncTableConfig1,
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int32 },
    add_column: { type: DATA_TYPE.String },
  },
};

export const modelSyncTableConfig3: ModelSyncTableConfig = {
  tableName: "testsync2",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    int8: { type: DATA_TYPE.Int8 },
    enum8: { type: DATA_TYPE.Enum8(`'enum1'=1,'enum2'= 2,'enum4'=4`) },
    enum16: {
      type: DATA_TYPE.Enum16(
        `'enum30000'=30000,'enum30100'= 30100,'enum30200' =30200`
      ),
    },
    arr: { type: DATA_TYPE.Other("Array( String )") },
    lowCardinalityInt8: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
    ip: { type: DATA_TYPE.Other(" IPv4 ") },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};
