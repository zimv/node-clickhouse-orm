import { ClickhouseOrm, DATA_TYPE, ModelSyncTableParams } from "../lib/index";

/**
 * defined Schema
 */
const table1Schema: ModelSyncTableParams = {
  tableName: "table1",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
  },
  autoCreate: true,
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

  console.log(chOrm.models);

  // do create
  await Table1Model.create({
    status: 1,
    time: new Date(),
    browser: "chrome",
    browser_v: "90.0.1.21",
  });

  //or

  // new data model
  const data = Table1Model.build({ status: 2 });

  // set value
  data.time = new Date();
  data.browser = "chrome";
  data.browser_v = "90.0.1.21";

  // do save
  const res = await data.save();
  console.log("save:", res);

  // do find
  Table1Model.find({
    select: "*",
    limit: 3,
  }).then((res) => {
    console.log("find:", res);
  });
};

doDemo();
