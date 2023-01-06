
import { ClickHouse } from "clickhouse";
import Model from "../lib/model";
import Schema from "../lib/schema";
import DataInstance from "../lib/dataInstance";
import * as Log from "../lib/log";

import { initConfig, modelSqlCreateTableConfig } from "../mock/index";
import { mocked } from "jest-mock";

jest.mock("../lib/schema");
jest.mock("../lib/dataInstance");
jest.mock("../lib/log");

describe("model can work normal", () => {
  let SchemaMock;
  let dataInstanceMock;
  let LogMock;
  beforeEach(() => {
    SchemaMock = mocked(Schema);
    SchemaMock.mockClear();

    dataInstanceMock = mocked(DataInstance);
    dataInstanceMock.mockClear();

    LogMock = mocked(Log.DebugLog);
    LogMock.mockClear();
  });

  test("We can check if the model called the class constructor", () => {
    expect(SchemaMock).not.toHaveBeenCalled();
    const model = new Model({
      client: new ClickHouse(initConfig.client),
      dbTableName: `${initConfig.db.name}.${modelSqlCreateTableConfig.tableName}`,
      debug: initConfig.debug,
      db: initConfig.db,
      schema: modelSqlCreateTableConfig.schema,
    });

    expect(SchemaMock).toHaveBeenCalledTimes(1);

    expect(model).toHaveProperty("build");
    expect(model).toHaveProperty("find");
    expect(model).toHaveProperty("create");
    expect(model).toHaveProperty("insertMany");
  });

  test("it should create a data normal", async () => {
    const model = new Model({
      client: new ClickHouse(initConfig.client),
      dbTableName: `${initConfig.db.name}.${modelSqlCreateTableConfig.tableName}`,
      debug: initConfig.debug,
      db: initConfig.db,
      schema: modelSqlCreateTableConfig.schema,
    });

    model.create({ status: 3 });

    expect(dataInstanceMock).toHaveBeenCalled();
  });

  test("it can find data", async () => {
    const model = new Model({
      client: new ClickHouse(initConfig.client),
      dbTableName: `${initConfig.db.name}.${modelSqlCreateTableConfig.tableName}`,
      debug: initConfig.debug,
      db: initConfig.db,
      schema: modelSqlCreateTableConfig.schema,
    });

    await model.find({ select: "*" });

    expect(LogMock).toHaveBeenCalledTimes(1);
  });

  test("it can insert many data", async () => {
    const model = new Model({
      client: new ClickHouse(initConfig.client),
      dbTableName: `${initConfig.db.name}.${modelSqlCreateTableConfig.tableName}`,
      debug: initConfig.debug,
      db: initConfig.db,
      schema: modelSqlCreateTableConfig.schema,
    });
    // Fix Schema mocked
    model["schemaInstance"]["columns"] = ["status"];
    model["schemaInstance"]["schemaConfig"] = modelSqlCreateTableConfig.schema;

    await model.insertMany([{ status: 1 }, { status: 2 }]);

    expect(LogMock).toHaveBeenCalled();
  });
});
