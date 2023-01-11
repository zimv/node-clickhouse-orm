[![Coverage Status](https://coveralls.io/repos/github/zimv/node-clickhouse-orm/badge.svg?branch=main)](https://coveralls.io/github/zimv/node-clickhouse-orm?branch=main)
<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM latest version"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05ad3e5cb52b4c149b47362377505916~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://npms.io/search?q=clickhouse-orm" alt="NPM latest version"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb03631752ce4ccf89445f94a4a02d97~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://www.npmjs.com/package/clickhouse-orm" alt="NPM total downloads"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4cb1a7ae1bf14cda804c0b3db0d50252~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github stars"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5df26c796d14e53a63f4f08afcd630f~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github forks"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57da9f95623043dbb052d873ebeac981~tplv-k3u1fbpfcp-zoom-1.image"></a>
<a href="https://github.com/zimv/node-clickhouse-orm" alt="Github contributors"><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab0ae120764e474db09c743634b102f9~tplv-k3u1fbpfcp-zoom-1.image"></a>

# clickhouse-orm  [(English README)](https://github.com/zimv/node-clickhouse-orm/blob/main/README.md)

[![Join the chat at https://gitter.im/zimv/node-clickhouse-orm](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8230cfb055bc4f1699e1749b6a7a3421~tplv-k3u1fbpfcp-zoom-1.image)](https://gitter.im/zimv/node-clickhouse-orm?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Clickhouse ORM for Nodejs. 使用 HTTP 接口通信. 使用 [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse) 作为客户端.

# 安装:

```
npm i clickhouse-orm
```

# 使用

**创建ORM实例：**

```typescript
const { ClickhouseOrm } = require("clickhouse-orm");

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

**定义数据模型：**
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

**创建数据和查询：**

```typescript
// create database 'orm_test'
await chOrm.createDatabase();
// register schema and create [if] table
const Table1Model = await chOrm.model(table1Schema);

// create data
const resCreate = await Table1Model.create({
  status: 1,
  time: new Date(),
  browser: "chrome",
  browser_v: "90.0.1.21",
});
console.log("create:", resCreate);

// find
Table1Model.find({
  select: "*",
  limit: 3,
}).then((res) => {
  // SQL: SELECT * from orm_test.table1 LIMIT 3
  console.log("find:", res);
});
```

**详情参考 [Basic Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/basic.js).**

# 文档

`注意`: **'?'** 代表可选项

### ClickhouseOrm



`db` : object<{name:string, engine?:string, cluster?:string}>

> name: 数据库名称

> engine?: 数据库引擎

> cluster?: 集群名称

`debug` : boolean

> Default: false

`client` : object

> 客户端驱动配置. 详情请看 [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse).

### Model模型参数配置
**1. ModelConfig**

|  | 是否必选项 | 类型 | 描述 |
| ------ | ------ | ------ | ------ |
| tableName | true | string | 表名 |
| schema | true | { [column]: { type, default? } } | `type`定义数据类型, `default` 设置默认值|

```typescript

import { DATA_TYPE, ModelConfig } from 'clickhouse-orm';
const xxxSchema: ModelConfig = {
  // table name
  tableName: "xxx",
  // define column name
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    status: { type: DATA_TYPE.Int32 },
    browser: { type: DATA_TYPE.String },
    browser_v: { type: DATA_TYPE.String },
  },
};
```

----
**2. ModelSyncTableConfig** （推荐）

|  | 是否必选项 | 类型 | 描述 |
| ------ | ------ | ------ | ------ |
| tableName | true | string | 表名 |
| schema | true | { [column]: { type, default? } } | `type`定义数据类型, `default` 设置默认值|
| options | true | string | 建表的其他配置 |
| autoCreate | true | boolean | 是否自动建表 |
| autoSync | false | boolean | 是否自动同步表结构`（谨慎使用）` |


支持自动创建表和自动同步表字段结构

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
模型创建时同步表结构(仅仅是字段列) 。模型创建时将会拉取远程数据库表的字段结构和当前代码中的 **schema** 进行对比，最终 **ORM** 会自动执行（增删改）语句。

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
> 


无法识别字段名修改！下面的配置将会删除 **column1**，新增 **column2**。
```typescript
oldSchema = {
  column1: { type: DATA_TYPE.String },
}
newSchema = {
  column2: { type: DATA_TYPE.String },
}
```


**详情参考 [SyncTable Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/syncTable.ts).**

----
**3. ModelSqlCreateTableConfig**

|  | 是否必选项 | 类型 | 描述 |
| ------ | ------ | ------ | ------ |
| tableName | true | string | 表名 |
| schema | true | { [column]: { type, default? } } | `type`定义数据类型, `default` 设置默认值|
| createTable | true | string | 自动建表的 **SQL** 语句，模型创建时会执行. 建议使用 **'IF NOT EXISTS'** 避免报错. <br> 注意 !!! >>>>> 如果表结构要变动，此配置不会同步，你需要使用其他客户端（比如终端连接数据库）去执行改表语句。最后再回来修改代码|


自定义建表语句，模型创建会自动创建表

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
    browser_v: { type: DATA_TYPE.String  },
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


### 数据类型

ClickHouse 数据类型. 下面大部分数据 **ORM** 会验证，但也仅验证基本的数据类型`number | string | boolean | date`，不会用最标准的数据类型验证。比如 **Int8**，**ORM** 只验证 **number** 类型。


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
**详情参考 [Datatype Example](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/datatype.ts).**
### Log
**setLogService** 是一个全局配置，每一个 **clickhouse-orm** 实例都会被影响。

`默认: console.log`

使用其他日志库示例: **[winston](https://github.com/winstonjs/winston)**

```javascript
const { setLogService } = require("clickhouse-orm");
const winston = require("winston");
const logger = winston.createLogger();

setLogService(logger.info);
```

### 直接写纯 SQL 语句：

```javascript
chOrm.client
  .query(`select * from orm_test.table1 limit 3`)
  .toPromise()
  .then((res) => {
    console.log("Use sql:", res);
  });
```

`chOrm.client` 是 [TimonKK/clickhouse](https://github.com/TimonKK/clickhouse) 的实例.

# [更多示例](https://github.com/zimv/node-clickhouse-orm/blob/main/examples/more.ts)

### 查询

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

ORM 最终执行的 SQL:

```sql
SELECT * from orm_test.table1 where status='1' and time>='2022-02-04 15:34:22' and time<='2022-02-05 15:34:22'  ORDER BY time ASC LIMIT 5
```

### 统计

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

ORM 最终执行的 SQL:

```sql
SELECT count(*) AS total from orm_test.table1
```

### 聚合查询

```javascript
Table1Model.find({
  select: `status,browser`,
  groupBy: "status,browser",
});
```

ORM 最终执行的 SQL:

```sql
SELECT status,browser from orm_test.table1  GROUP BY status,browser
```

### 嵌套查询

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

ORM 最终执行的 SQL:

```sql
SELECT count() as browserTotal from (SELECT browser from orm_test.table1  GROUP BY browser  )
```

### 创建数据和保存

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

ORM 最终执行的 SQL:

```
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":1,"browser":"chrome","browser_v":"90.0.1.21"}]\
```

### 创建并保存数据

```javascript
//do create
await Table1Model.create({
  status: 1,
  time: new Date(),
  browser: "chrome",
  browser_v: "90.0.1.21",
});
```

ORM 最终执行的 SQL:

```
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:51:16.919Z","status":1,"browser":"chrome","browser_v":"90.0.1.21"}]\
```

### 多条数据存储

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

ORM 最终执行的 SQL:

```sql
INSERT INTO orm_test.table1 (time,status,browser,browser_v) [{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"IE","browser_v":"10.0.1.21"},{"time":"2022-02-05T07:34:22.226Z","status":2,"browser":"FF","browser_v":"2.0.3"},{"time":"2022-02-05T07:34:22.226Z","status":3,"browser":"IE","browser_v":"1.1.1"}]
```

### 删除

```javascript

Table1Model.delete({
  where: `browser='Chrome'`,
})
```

ORM 最终执行的 SQL:

```sql
ALTER TABLE orm_test.table1  DELETE  WHERE browser='Chrome'
```

## cluster 集群

**创建一个集群实例：**

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

# 微信讨论群

[点击获取入群二维码](https://github.com/zimv/node-clickhouse-orm/issues/3)
