[![Coverage Status](https://coveralls.io/repos/github/zimv/node-clickhouse-orm/badge.svg?branch=main)](https://coveralls.io/github/zimv/node-clickhouse-orm?branch=main)
<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM latest version"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05ad3e5cb52b4c149b47362377505916~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://npms.io/search?q=clickhouse-orm" alt="NPM latest version"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb03631752ce4ccf89445f94a4a02d97~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM total downloads"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4cb1a7ae1bf14cda804c0b3db0d50252~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github stars"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5df26c796d14e53a63f4f08afcd630f~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github forks"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57da9f95623043dbb052d873ebeac981~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github contributors"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab0ae120764e474db09c743634b102f9~tplv-k3u1fbpfcp-zoom-1.image"></a>

# clickhouse-orm  [(中文 README)](https://github.com/zimv/node-clickhouse-orm/blob/main/README-zh.md)

[![Join the chat at https://gitter.im/zimv/node-clickhouse-orm](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8230cfb055bc4f1699e1749b6a7a3421~tplv-k3u1fbpfcp-zoom-1.image)](https://gitter.im/zimv/node-clickhouse-orm?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Clickhouse ORM for Nodejs. Send query over HTTP interface. Using [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse).

# Install:

```
npm i clickhouse-orm
```

# Usage

**Create instance：**

```typescript
const { ClickhouseOrm, DATA_TYPE, setLogService } = require("clickhouse-orm");

const chOrm = ClickhouseOrm({
  db: {
    name: "orm_test",
  },
  debug: true,
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
});
```

**Define Model：**
* ModelConfig

```typescript
import { DATA_TYPE, ModelSqlCreateTableConfig } from 'clickhouse-orm';
const xxxSchema: ModelSqlCreateTableConfig = {
  // table name
  tableName: "xxx",
  // define column name
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
    browser_v: { type: DATA_TYPE.String  }
  },
};
```
----
* ModelSyncTableConfig **(Recommended)**

Automatically create tables and automatically synchronize table field structures

```typescript
import { DATA_TYPE, ModelSyncTableConfig } from 'clickhouse-orm';
const oldSchema: ModelSyncTableConfig = {
  tableName: "xxx",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int16 },
    will_deleted: { type: DATA_TYPE.String },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};
```
Synchronize the table structure (just the field columns) when creating the model. When the model is created, the field structure of the remote database table will be pulled for comparison with the schema in the current code. Finally, the ORM will automatically execute (add, delete, and modify) statements.


```typescript
const newSchema = {
  ...oldSchema,
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    will_typeChanged: { type: DATA_TYPE.Int32 },
    add_column: { type: DATA_TYPE.String },
  }
}
chOrm.model(newSchema)
```

> clickhouse-orm-log: sync table structure: ALTER TABLE orm_test.xxx  DROP COLUMN will_deleted 

> clickhouse-orm-log: sync table structure: ALTER TABLE orm_test.xxx  ADD COLUMN add_column String 

> clickhouse-orm-log: sync table structure: ALTER TABLE orm_test.xxx  MODIFY COLUMN will_typeChanged Int32

Unrecognized field name modification! The following configuration will delete **column1** and add **column2**.

```typescript
oldSchema = {
  column1: { type: DATA_TYPE.String },
}
newSchema = {
  column2: { type: DATA_TYPE.String },
}
```

**More in [SyncTable Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/syncTable.ts).**

----
* ModelSqlCreateTableConfig

Customized table creation statement, and the table will be created automatically when the model is created

```typescript

import { DATA_TYPE, ModelSqlCreateTableConfig } from 'clickhouse-orm';
const xxxSchema: ModelSqlCreateTableConfig = {
  // table name
  tableName: "xxx",
  // define column name
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
    browser_v: { type: DATA_TYPE.String  }
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
};
```
**create / build + save / find：**

```javascript
const doDemo = async () => {
  // create database 'orm_test'
  // SQL: CREATE DATABASE IF NOT EXISTS orm_test
  await chOrm.createDatabase();

  // register schema and create [if] table
  // createTable() SQL: CREATE TABLE IF NOT EXISTS orm_test.table1...
  const Table1Model = await chOrm.model(table1Schema);

  // new data model
  const data = Table1Model.build({ status: 2 });

  // set value
  data.time = new Date();
  data.browser = "chrome";
  data.browser_v = "90.0.1.21";

  // do save
  const res = await data.save();
  // SQL: INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":2,"browser":"chrome","browser_v":"90.0.1.21"}]
  console.log("save:", res);

  // create === build + save
  const resCreate = await Table1Model.create({
    status: 1,
    time: new Date(),
    browser: "chrome",
    browser_v: "90.0.1.21",
  });
  console.log("create:", resCreate);

  // do find
  Table1Model.find({
    select: "*",
    limit: 3,
  }).then((res) => {
    // SQL: SELECT * from orm_test.table1    LIMIT 3
    console.log("find:", res);
  });
};

doDemo();
```

**More in [Basic Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/basic.js).**

# Overview

`Note`: '?' is a Optional

### ClickhouseOrm



`db` : object<{name:string, engine?:string, cluster?:string}>

> name: database name

> engine?: database engine

> cluster?: cluster name

`debug` : boolean

> Default: false

`client` : object

> Drive configuration. More in [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse).

### ModelConfig
* ModelConfig

|  | required | type | description |
| ------ | ------ | ------ | ------ |
| tableName | true | string | It is the table name. |
| schema | true | { [column]: { type, default? } } | `Type` defines the data type, and `default` sets the default value |

----
* ModelSyncTableConfig

|  | required | type | description |
| ------ | ------ | ------ | ------ |
| tableName | true | string | It is the table name. |
| schema | true | { [column]: { type, default? } } | `Type` defines the data type, and `default` sets the default value |
| options | true | string | Create table setting |
| autoCreate | true | boolean | Auto create table |
| autoSync | false | boolean | Auto sync table structure`(Careful use)` |

----
* ModelSqlCreateTableConfig

|  | required | type | description |
| ------ | ------ | ------ | ------ |
| tableName | true | string | It is the table name. |
| schema | true | { [column]: { type?, default? } } | `Type` defines the data type, and `default` sets the default value |
| createTable | true | string | It is the SQL for creating tables.When model is executed, this SQL will be executed. It is suggested to add 'IF NOT EXISTS'. <br> Watch out !!! >>>>> If the table already exists and you want to modify it. You need to execute the modification sql through other clients（Such as Remote terminal） and update the code of the Schema!!!|



### DATA_TYPE

Clickhouse data type. Most of the following data will be validated by ORM, but only the basic data type `number | string | boolean | date` will be validated, not the most standard data type. For example, in `Int8`, ORM only verifies the `number` type.


```typescript
  UInt8;
  UInt16;
  UInt32;
  UInt64;
  Int8;
  Int16;
  Int32;
  Int64;
  Float32;
  Float64;
  Boolean;
  String;
  UUID;
  Date;
  Date32;
  DateTime;
  DateTime64;
  /**
   *
   * @param Number
   * @example DATA_TYPE.FixedString(3)
   */
  FixedString;
  /**
   *
   * @param DATA_TYPE
   * @example DATA_TYPE.LowCardinality(DATA_TYPE.String)
   */
  LowCardinality;
  /**
   *
   * @param string
   * @example DATA_TYPE.Enum8(`'hello' = 1, 'world' = 2`)
   * @desc number [-128, 127]
   */
  Enum8;
  /**
   *
   * @param string
   * @example DATA_TYPE.Enum16(`'hello' = 3000, 'world' = 3500`)
   * @desc number [-32768, 32767]
   */
  Enum16;
  /**
   *
   * @param columnType
   * Clickhouse dataTypes: Array(T), JSON, Map(key, value), IPv4, Nullable(), more...
   * @example DATA_TYPE.Other('Array(String)') , DATA_TYPE.Other('Int8')
   * @desc No `INSERT` data validation provided
   */
  Other;
```
**More in [Datatype Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/datatype.ts).**
### Log

The **setLogService** is a global configuration method and will affect all instances.

`Default: console.log`

Custom example: **[winston](https://github.com/winstonjs/winston)**

```javascript
const { setLogService } = require("clickhouse-orm");
const winston = require("winston");
const logger = winston.createLogger();

setLogService(logger.info);
```

### Use SQL directly：

```javascript
chOrm.client
  .query(`select * from orm_test.table1 limit 3`)
  .toPromise()
  .then((res) => {
    console.log("Use sql:", res);
  });
```

The `chOrm.client` is the [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse) instance.

# [More Examples](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/more.ts)

### Find

```javascript
import * as dayjs from "dayjs";

queryExample1({
  Model: Table1Model,
  status: 1,
  beginTime: dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss"),
  endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
}).then((res) => {
  console.log("queryExample1:", res);
});

const queryExample1 = ({ Model, status, beginTime, endTime }) => {
  let wheres = [],
    where;
  if (status) wheres.push(`status='${status}'`);
  if (beginTime) wheres.push(`time>='${beginTime}'`);
  if (endTime) wheres.push(`time<='${endTime}'`);
  if (wheres.length > 0) where = wheres.join(" and ");

  return Model.find({
    where,
    select: `*`,
    orderBy: "time ASC",
    limit: 5,
  });
};
```

Final executed SQL:

```sql
SELECT * from orm_test.table1 where status='1' and time>='2022-02-04 15:34:22' and time<='2022-02-05 15:34:22'  ORDER BY time ASC LIMIT 5
```

### Count

```javascript
countExample1({
  Model: Table1Model,
}).then((res) => {
  console.log("countExample1:", res);
});

const countExample1 = ({ Model }) => {
  return Model.find({
    select: `count(*) AS total`,
  });
};
```

Final executed SQL:

```sql
SELECT count(*) AS total from orm_test.table1
```

### GroupBy

```javascript
Table1Model.find({
  select: `status,browser`,
  groupBy: "status,browser",
});
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
    groupBy: "browser",
  },
  {
    select: `count() as browserTotal`,
  },
]);
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
data.browser = "chrome";
data.browser_v = "90.0.1.21";

// do save
data.save().then((res) => {
  console.log("save:", res);
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
  browser: "chrome",
  browser_v: "90.0.1.21",
});
```

Final executed SQL:

```
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":1,"browser":"chrome","browser_v":"90.0.1.21"}]\
```

### InsertMany

```javascript
const list = [
  { status: 2, browser: "IE", browser_v: "10.0.1.21" },
  { status: 2, browser: "FF", browser_v: "2.0.3" },
  { status: 3, browser: "IE", browser_v: "1.1.1" },
];

Table1Model.insertMany(list);
// or
Table1Model.insertMany(
  list.map((item) => {
    const data = Table1Model.build();
    // set value
    data.time = new Date();
    data.status = item.status;
    data.browser = item.browser;
    data.browser_v = item.browser_v;
    return data;
  })
);
```

Final executed SQL:

```sql
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"IE","browser_v":"10.0.1.21"},{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"FF","browser_v":"2.0.3"},{"time":"2022-02-05T07:34:22.226Z","status":3,"browser":"IE","browser_v":"1.1.1"}]
```

### delete

```javascript

Table1Model.delete({
  where: `browser='Chrome'`,
})
```

Final executed SQL:

```sql
ALTER TABLE orm_test.table1  DELETE  WHERE browser='Chrome'
```

## cluster

**Create a cluster instance：**

```javascript
const { ClickhouseOrm, DATA_TYPE, setLogService } = require("clickhouse-orm");

const chOrm = ClickhouseOrm({
  db: {
    name: "orm_cluster_test",
    cluster: "default_cluster",
  },
  // ...other
});
const table2Schema = {
  // table name
  tableName: "table2",
  ...other,
};

// create database 'orm_cluster_test'
// SQL: CREATE DATABASE IF NOT EXISTS orm_cluster_test ON CLUSTER default_cluster
await chOrm.createDatabase();

// register schema and create [if] table
// createTable() SQL: CREATE TABLE IF NOT EXISTS orm_cluster_test.table2 ON CLUSTER default_cluster...
const Table2Model = await chOrm.model(table2Schema);
```

# Wechat Discussion

[Click to join](https://github.com/zimv/node-clickhouse-orm/issues/3)
