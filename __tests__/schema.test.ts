import Schema from "../lib/schema";
import { modelSqlCreateTableParams } from "..//mock/index";

describe("Schema test", () => {
  test("generated schema should have one property that is proxyAttr", () => {
    const instance = new Schema(modelSqlCreateTableParams.schema);

    expect(instance).toHaveProperty("proxyAttr");
  });
});
