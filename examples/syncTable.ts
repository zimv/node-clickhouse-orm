import { ClickhouseOrm, DATA_TYPE, ModelSyncTableConfig } from "../lib/index";
import { clientConfig } from "../mock";

/**
 * defined Model
 */
const commanParams = {
  tableName: "testsync",
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};
const newModelSyncTableConfig = {
  ...commanParams,
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int16 },
    will_deleted: { type: DATA_TYPE.String },
  },
};

const updateModelSyncTableConfig = {
  ...commanParams,
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int32 },
    add_column: { type: DATA_TYPE.String },
  },
};

/**
 * new instance
 */
const db = {
  name: "orm_test",
};
const chOrm = ClickhouseOrm({
  client: clientConfig,
  db,
  debug: true,
});

const doDemo = async () => {
  // create database 'orm_test'
  await chOrm.createDatabase();
  await chOrm.client
    .query(`DROP TABLE IF EXISTS ${db.name}.${commanParams.tableName}`)
    .toPromise();

  // create new table
  await chOrm.model(newModelSyncTableConfig);
  // update table
  await chOrm.model(updateModelSyncTableConfig);
};

doDemo();
