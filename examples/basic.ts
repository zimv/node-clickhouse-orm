import { ClickHouse } from 'clickhouse';
import { ClickHouseOrm, VALIDATION_COLUMN_VALUE_TYPE, setLogService } from '../lib/index';

const demo1Schema = {
  tableName: 'demo1',
  schema: {
    time: { type: VALIDATION_COLUMN_VALUE_TYPE.DateTime, default: Date },
    status: { type: VALIDATION_COLUMN_VALUE_TYPE.Int32 },
    browser: { type: VALIDATION_COLUMN_VALUE_TYPE.String },
    browser_v: {},
  },
  createTable: (dbTableName) => {
    // dbTableName = db + '.' + tableName = (orm_test.demo1)
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

const db = 'orm_test';
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

const chOrm = ClickHouseOrm({client, db, debug:true});

const doDemo = async ()=>{
  await chOrm.createDatabase();
  const Demo1Model = await chOrm.schemaRegister(demo1Schema);
  const data = Demo1Model();
  data.time = new Date();
  data.status = 1;
  data.browser = 'chrome';
  data.browser_v = '90.0.1.21';
  data.save().then((res)=>{
    console.log(res);
    Demo1Model.find({
      select: '*'
    });
  });
}

doDemo();