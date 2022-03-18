import Model from "../lib/model";
import Schema from "../lib/schema";
import DataInstance from "../lib/dataInstance";
import * as Log from "../lib/log";

import { initConfig, initSchema } from "..//mock/index";
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
      client: initConfig.client,
      dbTableName: `${initConfig.db.name}.${initSchema.tableName}`,
      debug: initConfig.debug,
      schema: initSchema.schema,
    });

    expect(SchemaMock).toHaveBeenCalledTimes(1);

    expect(model).toHaveProperty("build");
    expect(model).toHaveProperty("find");
    expect(model).toHaveProperty("create");
    expect(model).toHaveProperty("insertMany");
  });

  test("it should create a data normal", async () => {
    const model = new Model({
      client: initConfig.client,
      dbTableName: `${initConfig.db.name}.${initSchema.tableName}`,
      debug: initConfig.debug,
      schema: initSchema.schema,
    });

    model.create({ status: 3 });

    expect(dataInstanceMock).toHaveBeenCalled();
  });

  test("it can find data", async () => {
    const model = new Model({
      client: initConfig.client,
      dbTableName: `${initConfig.db.name}.${initSchema.tableName}`,
      debug: initConfig.debug,
      schema: initSchema.schema,
    });

    const res = await model.find({ select: "*" });

    expect(res.length).toBeGreaterThanOrEqual(0);
  });

  test("it can insert many data", async () => {
    const model = new Model({
      client: initConfig.client,
      dbTableName: `${initConfig.db.name}.${initSchema.tableName}`,
      debug: initConfig.debug,
      schema: initSchema.schema,
    });
    model["schemaInstance"]["columns"] = ["status"];

    await model.insertMany([{ status: 1 }, { status: 2 }]);

    expect(LogMock).toHaveBeenCalled();
  });
});
