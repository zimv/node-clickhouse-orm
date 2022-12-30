import { ClickhouseOrm, DATA_TYPE, setLogService } from "../lib/index";

/**
 * defined Schema
 */
const table1Schema = {
  tableName: "full_datatype_table",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
    fixedString: { type: DATA_TYPE.FixedString(3) },
    lowCardinality: { type: DATA_TYPE.LowCardinality(DATA_TYPE.FixedString(4)) },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
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
