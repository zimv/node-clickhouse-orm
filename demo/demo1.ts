import { ClickHouse } from 'clickhouse';
import ClickHouseOrm from '../lib/index';


const demo1Schema = {
  tableName: 'demo1',
  schema: {
    time: { type: Date, default: Date }, // 创建时间
    status: { type: Number }, // 请求接口
    browser: { type: String }, // 请求参数
    browser_v: { type: String }, // 请求方法
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
  data.save();
}
doDemo();