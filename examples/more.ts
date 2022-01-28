import * as dayjs from 'dayjs';
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

  // query example 1
  await queryExample1({
    Model: Table1Model,
    status: 1,
    beginTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }).then(res=>{
    console.log('queryExample1:', res);
  });

  // count example 1
  await countExample1({
    Model: Table1Model,
  }).then(res=>{
    console.log('countExample1:', res);
  });
  
}

const queryExample1 = ({
  Model,
  status,
  beginTime,
  endTime
}) => {
  let wheres=[],where;
  if(status) wheres.push(`status='${status}'`);
  if(beginTime) wheres.push(`time>='${beginTime}'`);
  if(endTime) wheres.push(`time<='${endTime}'`);
  if(wheres.length>0) where = wheres.join(' and ');

  return Model.find({
    where,
    select: `*`,
    orderBy: 'time ASC'
  })
}

const countExample1 = ({
  Model,
}) => {
  return Model.find({
    select: `count(*) AS total`,
  })
}

doDemo();