import Schema from "../lib/schema";
import { modelSqlCreateTableConfig } from "..//mock/index";

describe("Schema test", () => {
  test("generated schema should have one property that is proxyAttr", () => {
    const instance = new Schema(modelSqlCreateTableConfig.schema);

    expect(instance).toHaveProperty("proxyAttr");
  });
});
