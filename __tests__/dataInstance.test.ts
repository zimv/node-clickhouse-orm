import { ClickhouseOrm, setLogService } from "../lib";
import { initConfig, initSchema } from "../mock/index";
import * as Log from "../lib/log";

jest.mock("../lib/log");

describe("dataInstance checkColumnExist()", () => {
  let orm;
  beforeEach(() => {
    setLogService(console.warn);
    orm = ClickhouseOrm(initConfig);
  });
  test("build checkColumnExist()", async () => {

    const model = await orm.model(initSchema);
    model.build({
      name: 'zimv',
    });

    expect(Log.ErrorLog).toHaveBeenCalledTimes(1);
  });
  
  test("dataInstance column set checkColumnExist()", async () => {
    const model = await orm.model(initSchema);

    const data = model.build({
      old: 23
    });
    data.name = 'zimv';
      
    expect(Log.ErrorLog).toHaveBeenCalledTimes(2);
  });
});
