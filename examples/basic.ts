import { ClickHouse } from 'clickhouse';
import { ClickHouseOrm, VALIDATION_COLUMN_VALUE_TYPE, setLogService } from '../lib/index';

/**
 * defined Schema 
 */
const table1Schema = {
  tableName: 'table1',
  schema: {
    time: { type: VALIDATION_COLUMN_VALUE_TYPE.DateTime, default: Date },
    status: { type: VALIDATION_COLUMN_VALUE_TYPE.Int32 },
    browser: { type: VALIDATION_COLUMN_VALUE_TYPE.String },
    browser_v: {},
  },
  createTable: (dbTableName) => {
    // dbTableName = db + '.' + tableName = (orm_test.table1)
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
}

/**
 * new ClickHouse
 */
const client = new ClickHouse({
  url: 'localhost',
  port: '8123',
  basicAuth: {
    username: 'default',
    password: '',
  },
  debug: false,
  isUseGzip: true,
  format: 'json', // "json" || "csv" || "tsv"
});

/**
 * new Orm
 */
const db = 'orm_test';
const chOrm = ClickHouseOrm({client, db, debug:true});

const doDemo = async ()=>{
  // create database 'orm_test'
  await chOrm.createDatabase();

  // register schema and create [if] table
  const Table1Model = await chOrm.schemaRegister(table1Schema);

  // new data model
  const data = Table1Model();

  // set value
  data.time = new Date();
  data.status = 1;
  data.browser = 'chrome';
  data.browser_v = '90.0.1.21';

  // do save 
  data.save().then((res)=>{
    console.log(res);
    // do select
    Table1Model.find({
      select: '*'
    });
  });
}

doDemo();