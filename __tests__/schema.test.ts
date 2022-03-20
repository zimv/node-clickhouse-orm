import Schema from "../lib/schema";
import { initSchema } from "..//mock/index";

describe("Orm can work normal", () => {
  test("generated schema should have one property that is proxyAttr", () => {
    const instance = new Schema(initSchema.schema);

    expect(instance).toHaveProperty("proxyAttr");
  });
});
