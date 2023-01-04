import { ClickhouseOrm, setLogService } from "../lib";
import { initConfig, modelSqlCreateTableParams } from "../mock/index";
import * as Log from "../lib/log";

jest.mock("../lib/log");

describe("dataInstance test", () => {
  let orm;
  beforeEach(() => {
    setLogService(console.error);
    orm = ClickhouseOrm(initConfig);
  });
  // test("build checkColumnExist()", async () => {

  //   const model = await orm.model(modelSqlCreateTableParams);
  //   model.build({
  //     name: 'zimv',
  //   });

  //   expect(Log.ErrorLog).toHaveBeenCalledTimes(1);
  // });
  
  // test("dataInstance column set checkColumnExist()", async () => {
  //   const model = await orm.model(modelSqlCreateTableParams);

  //   const data = model.build({
  //     old: 23
  //   });
  //   data.name = 'zimv';
      
  //   expect(Log.ErrorLog).toHaveBeenCalledTimes(2);
  // });

  test("dataInstance column validate", async () => {
    const model = await orm.model(modelSqlCreateTableParams);
    try{
      model.build({
        browser: 100
      })
    }catch(e){
      expect(e.message).toEqual(expect.stringContaining(`column[browser]-value(100): 'String' type validation failed`))
    }
    expect(Log.ErrorLog).toHaveBeenCalledTimes(1)
  });
  
});
