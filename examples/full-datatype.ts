import { ClickhouseOrm, DATA_TYPE, ModelSyncTableParams } from "../lib/index";

/**
 * defined Schema
 */
const table1Schema: ModelSyncTableParams = {
  tableName: "full_datatype_table",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int64 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
    fixedString: { type: DATA_TYPE.FixedString(3) },
    add2: { type: DATA_TYPE.String },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};

/**
 * new instance
 */
const db = {
  name: "orm_test",
  engine: "Atomic", // default: Atomic
};
const chOrm = ClickhouseOrm({
  client: {
    url: "localhost",
    port: "8123",
    basicAuth: {
      username: "default",
      password: "",
    },
    debug: false,
    isUseGzip: true,
    format: "json", // "json" || "csv" || "tsv"
  },
  db,
  debug: true,
});

const doDemo = async () => {
  // create database 'orm_test'
  await chOrm.createDatabase();

  // register schema and create [if] table
  const Table1Model = await chOrm.model(table1Schema);

  // do create
  await Table1Model.create({
    status: 1,
    time: new Date(),
    browser: "chrome",
    browser_v: "90.0.1.21",
    fixedString: '12',
    lowCardinality: 'test'
  });

  // do find
  Table1Model.find({
    select: "*",
    limit: 3,
  }).then((res) => {
    console.log("find:", res);
  });
};

doDemo();
