import { ClickhouseOrm, DATA_TYPE, ModelSyncTableParams } from "../lib/index";
import { clientConfig } from "../mock";

/**
 * defined Schema
 */
const tableSchema: ModelSyncTableParams = {
  tableName: "datatype_table",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    int32: { type: DATA_TYPE.Int32 },
    string: { type: DATA_TYPE.String },
    fixedString: { type: DATA_TYPE.FixedString(3) },
    lowStr: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
    lowfixed: { type: DATA_TYPE.LowCardinality(DATA_TYPE.FixedString(3)), default: '987' },
    uuid: { type: DATA_TYPE.UUID },
    enum8: { type: DATA_TYPE.Enum8(`'enum1'=1,'enum2'=2,'enum4'=4`) },
    enum16: { type: DATA_TYPE.Enum16(`'enum30000'=30000,'enum30100'=30100,'enum30200'=30200`) },
    arr: { type: DATA_TYPE.Other('Array(String)') },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
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
  client: clientConfig,
  db,
  debug: true,
});

const doDemo = async () => {
  // create database 'orm_test'
  await chOrm.createDatabase();

  await chOrm.client
    .query(`DROP TABLE IF EXISTS ${db.name}.${tableSchema.tableName}`)
    .toPromise();

  // register schema and create [if] table
  const tableModel = await chOrm.model(tableSchema);

  const uuidRes: any = await chOrm.client
    .query(`SELECT generateUUIDv4() as uuid`)
    .toPromise();
  await tableModel.create({
    time: new Date(),
    int32: 666,
    string: "90.0.1.21",
    fixedString: "12",
    lowStr: "low string",
    lowfixed: '123',
    uuid: uuidRes[0].uuid,
    enum8: "enum1",
    enum16: "enum30000",
    arr: ['str1','str2'],
  });
  await tableModel.create({
    time: new Date(),
    int32: 666,
    string: "90.0.1.21",
    fixedString: "12",
    lowStr: "low string 2",
    uuid: uuidRes[0].uuid,
    enum8: "enum4",
    enum16: "enum30100",
    arr: ['arr1'],
  });

  // do find
  tableModel
    .find({
      select: "*,CAST(enum8, 'Int8'),CAST(enum16, 'Int16')",
      limit: 10,
    })
    .then((res) => {
      console.log("find:", res);
    });
};

doDemo();
