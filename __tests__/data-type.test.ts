import { ClickhouseOrm, DATA_TYPE } from "../lib";
import { initConfig } from "../mock/index";

const tableSchema = {
  tableName: "full_datatype_table",
  schema: {
    time: { type: DATA_TYPE.DateTime, default: Date },
    int32: { type: DATA_TYPE.Int32 },
    string: { type: DATA_TYPE.String },
    fixedString: { type: DATA_TYPE.FixedString(3) },
    lowStr: { type: DATA_TYPE.LowCardinality(DATA_TYPE.String) },
    lowfixed: {
      type: DATA_TYPE.LowCardinality(DATA_TYPE.FixedString(3)),
      default: "987",
    },
    uuid: { type: DATA_TYPE.UUID },
    enum8: { type: DATA_TYPE.Enum8(`'enum1'=1,'enum2'=2,'enum4'=4`) },
    enum16: {
      type: DATA_TYPE.Enum16(
        `'enum30000'=30000,'enum30100'=30100,'enum30200'=30200`
      ),
    },
    arr: { type: DATA_TYPE.Other("Array(String)") },
  },
  options: `ENGINE = MergeTree
  PARTITION BY toYYYYMM(time)
  ORDER BY time`,
  autoCreate: true,
  autoSync: true,
};

describe("DATA_TYPE test", () => {
  let orm;
  beforeAll(async () => {
    orm = ClickhouseOrm(initConfig);
    await orm.createDatabase();
    // delete old table
    return orm.client
      .query(
        `DROP TABLE IF EXISTS ${initConfig.db.name}.${tableSchema.tableName}`
      )
      .toPromise();
  });

  test("`", async () => {
    const tableModel = await orm.model(tableSchema);
    const uuidRes: any = await orm.client
      .query(`SELECT generateUUIDv4() as uuid`)
      .toPromise();
    await tableModel.create({
      time: new Date(),
      int32: 666,
      string: "90.0.1.21",
      fixedString: "12",
      lowStr: "low string",
      lowfixed: "123",
      uuid: uuidRes[0].uuid,
      enum8: "enum1",
      enum16: "enum30000",
      arr: ["str1", "str2"],
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
      arr: ["arr1"],
    });

    const res = await tableModel.find({
      select: "*,CAST(enum8, 'Int8') as enum8Num,CAST(enum16, 'Int16')",
      limit: 10,
    });
    expect(res[0].arr).toEqual(['str1','str2']);
    expect(res[1].lowfixed).toBe('987');
    expect(res[1].enum8Num).toEqual(4);
    expect(res[1].uuid.length>0).toBe(true);
  });
});
