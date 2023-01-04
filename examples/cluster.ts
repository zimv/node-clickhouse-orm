import { ClickhouseOrm, DATA_TYPE, ModelSqlCreateTableParams } from "../lib/index";
import * as colors from "colors/safe";

/**
 * defined Schema
 */
const table1Schema: ModelSqlCreateTableParams = {
  tableName: "table1",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
  },
  createTable: (dbTableName, db) => {
    // dbTableName = db + '.' + tableName = (orm_test.table1)
    return `
      CREATE TABLE IF NOT EXISTS ${dbTableName} ON CLUSTER ${db.cluster}
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

/**
 * new instance
 */
const db = {
  name: "orm_cluster_test",
  cluster: "default_cluster",
};
const chOrm = ClickhouseOrm({
  client: {
    // It must be a clickhouse cluster
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
  try {
    // create database 'orm_cluster_test'
    await chOrm.createDatabase();
  } catch (err) {
    console.log(
      `${colors.blue(
        "------- Tips: It must be a clickhouse cluster ------"
      )} \n`
    );
    console.log(err);
    return;
  }

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
