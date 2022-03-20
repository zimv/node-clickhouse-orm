import Orm from "../lib/orm";
import * as Log from "../lib/log";
import { initConfig, initSchema } from "..//mock/index";

jest.mock("../lib/log");

describe("Orm can work normal", () => {
  let orm;
  beforeEach(() => {
    orm = new Orm(initConfig);
  });

  test("generated orm should have two property that are createDatabase and model", () => {
    expect(orm).toHaveProperty("createDatabase");
    expect(orm).toHaveProperty("model");
  });

  test("create database success", async () => {
    await orm.createDatabase();

    expect(Log.Log).toHaveBeenCalledTimes(1);
  });

  test("create model success", async () => {
    await orm.model(initSchema);

    expect(Log.DebugLog).toHaveBeenCalledTimes(1);
  });
});
