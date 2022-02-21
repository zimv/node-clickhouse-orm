<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM latest version"><img src="https://img.shields.io/npm/v/clickhouse-orm.svg"></a>
<a href="https://npms.io/search?q=clickhouse-orm" alt="NPM latest version"><img src="https://badges.npms.io/clickhouse-orm.svg"></a>
<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM total downloads"><img src="https://img.shields.io/npm/dt/clickhouse-orm.svg"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github stars"><img src="https://img.shields.io/github/stars/zimv/node-clickhouse-orm.svg?style=social&label=Star"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github forks"><img src="https://img.shields.io/github/forks/zimv/node-clickhouse-orm.svg?style=social&label=Fork"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github contributors"><img src="https://img.shields.io/github/contributors/zimv/node-clickhouse-orm.svg"></a>
# clickhouse-orm
Clickhouse ORM for Nodejs. Send query over HTTP interface. Using [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse).

# Install:

``` 
npm i clickhouse-orm 
``` 

# Usage

**Create instance：**


```javascript

const { ClickhouseOrm, DATA_TYPE, setLogService} = require('clickhouse-orm');

const chOrm = ClickhouseOrm({
  db: {
    name: 'orm_test',
  },
  debug: true,
  client: {
    url: 'localhost',
    port: '8123',
    basicAuth: {
      username: 'default',
      password: '',
    },
    debug: false,
    isUseGzip: true,
    format: 'json', // "json" || "csv" || "tsv"
  },
});

```

**Define Schema：**
```javascript
const table1Schema = {
  // table name
  tableName: 'table1',
  // define column name
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: {},
  },
  // create table sql
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
```

**create / build + save / find：**
```javascript
const doDemo = async ()=>{
  // create database 'orm_test'
  await chOrm.createDatabase();
  
  // register schema and create [if] table
  const Table1Model = await chOrm.model(table1Schema);
    
  // new data model
  const data = Table1Model.build({status:2});
    
  // set value
  data.time = new Date();
  data.browser = 'chrome';
  data.browser_v = '90.0.1.21';
    
  // do save
  const res = await data.save();
  // SQL: INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":2,"browser":"chrome","browser_v":"90.0.1.21"}]
  console.log('save:', res);

  // create === build + save 
  const resCreate = await Table1Model.create({
      status: 1,
      time: new Date(),
      browser: 'chrome',
      browser_v: '90.0.1.21'
  })
  console.log('create:', resCreate);
  
  // do find
  Table1Model.find({
      select: '*',
      limit: 3
  }).then((res)=>{
      // SQL: SELECT * from orm_test.table1    LIMIT 3
      console.log('find:', res);
  });
}

doDemo();
```

More in [Basic Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/basic.js).

# Overview
`Note`: '?' is a Optional
### ClickhouseOrm
`db` : object<{name:string, engine?:string}>
> name: database name

> engine: database engine

`debug` : boolean
> Default: false

`client` : object
> Drive configuration. More in [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse).
### Schema
`tableName` : string
> It is the table name.

`schema` :  { [column]: { type?, default? } } 
> The `type` will be verified, The `default` is the default value for column.

`createTable` : string
> It is the SQL for creating tables.When model is executed, this SQL will be executed. It is suggested to add 'IF NOT EXISTS'.



Watch out !!! >>>>> If the table already exists and you want to modify it. You need to execute the modification sql through other clients（Such as Remote terminal） and update the code of the Schema!!!


```javascript
const table1Schema = {
  // table name
  tableName: 'table1',
  // define column
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: {},
  },
  // create table sql
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

// register schema and create [if] table
const Table1Model = await chOrm.model(table1Schema);
```

### DATA_TYPE
The clickhouse data types. Some types are defined here.

Columns with defined types will be verified. It only checks the basic type of data, not the most standard value. They are `number | string | boolean | date`. 



```javascript
export enum DATA_TYPE {
  UInt8 = 'number',
  UInt16 = 'number',
  UInt32 = 'number',
  UInt64 = 'number',
  UInt128 = 'number',
  UInt256 = 'number',
  Int8 = 'number',
  Int16 = 'number',
  Int32 = 'number',
  Int64 = 'number',
  Int128 = 'number',
  Int256 = 'number',
  Float32 = 'number',
  Float64 = 'number',
  Boolean = 'boolean',
  String = 'string',
  UUID = 'string',
  Date = 'date|string|number',
  Date32 = 'date|string|number',
  DateTime = 'date|string|number',
  DateTime64 = 'date|string|number',
}
```

```javascript
schema: {
  time: { type: DATA_TYPE.DateTime, default: Date },
  [column]: { type?, default? }
}
```

### Log
The **setLogService** is a global configuration method and will affect all instances.


```Default: console.log```


Custom example:  **[winston](https://github.com/winstonjs/winston)**

```javascript
const { setLogService } = require('clickhouse-orm');
const winston = require('winston');
const logger = winston.createLogger();

setLogService(logger.info);
```


### Use SQL directly：
```javascript
chOrm.client.query(`select * from orm_test.table1 limit 3`).toPromise().then(res=>{
  console.log('Use sql:', res);
});
```

The `chOrm.client` is the [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse) instance.



# [More Examples](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/more.ts)
### Find

```javascript
import * as dayjs from 'dayjs';

queryExample1({
  Model: Table1Model,
  status: 1,
  beginTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
  endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
}).then(res=>{
  console.log('queryExample1:', res);
});

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
    orderBy: 'time ASC',
    limit: 5,
  })
}
```
Final executed SQL:
```sql
SELECT * from orm_test.table1 where status='1' and time>='2022-02-04 15:34:22' and time<='2022-02-05 15:34:22'  ORDER BY time ASC LIMIT 5
```

### Count

```javascript
countExample1({
  Model: Table1Model,
}).then(res=>{
  console.log('countExample1:', res);
});
  
const countExample1 = ({
  Model,
}) => {
  return Model.find({
    select: `count(*) AS total`,
  })
}
```
Final executed SQL:
```sql
SELECT count(*) AS total from orm_test.table1
```

### GroupBy

```javascript
Table1Model.find({
  select: `status,browser`,
  groupBy: 'status,browser',
})
```

Final executed SQL:
```sql
SELECT status,browser from orm_test.table1  GROUP BY status,browser
```

### Nested Queries


```javascript
Table1Model.find([
  {
    select: `browser`,
    groupBy: 'browser',
  },
  {
    select: `count() as browserTotal`,
  },
])
```

Final executed SQL:
```sql
SELECT count() as browserTotal from (SELECT browser from orm_test.table1  GROUP BY browser  )
```

### save
```javascript
// new data model
const data = Table1Model.build();

// set value
data.time = new _Date_();
data.status = 1;
data.browser = 'chrome';
data.browser_v = '90.0.1.21';

// do save 
data.save().then((res)=>{
  console.log('save:', res);
});
```
Final executed SQL:
```
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":1,"browser":"chrome","browser_v":"90.0.1.21"}]\
```

### create
```javascript
//do create
await Table1Model.create({
    status: 1,
    time: new Date(),
    browser: 'chrome',
    browser_v: '90.0.1.21'
})
```
Final executed SQL:
```
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":1,"browser":"chrome","browser_v":"90.0.1.21"}]\
```

### InsertMany

```javascript
const list = [
  { status: 2, browser: 'IE', browser_v: '10.0.1.21' },
  { status: 2, browser: 'FF', browser_v: '2.0.3' },
  { status: 3, browser: 'IE', browser_v: '1.1.1' },
];

Table1Model.insertMany(list)
// or
Table1Model.insertMany(
  list.map(item=>{
    const data = Table1Model.build();
    // set value
    data.time = new Date();
    data.status = item.status;
    data.browser = item.browser;
    data.browser_v = item.browser_v;
    return data;
  })
)
```
Final executed SQL:
```sql
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"IE","browser_v":"10.0.1.21"},{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"FF","browser_v":"2.0.3"},{"time":"2022-02-05T07:34:22.226Z","status":3,"browser":"IE","browser_v":"1.1.1"}]
```

# Wechat Discussion
[Click to join](https://github.com/zimv/node-clickhouse-orm/issues/3)

