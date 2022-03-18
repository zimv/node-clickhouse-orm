import Orm from "../lib/orm";

import { initConfig, initSchema } from "..//mock/index";

// integration test
describe("test whole flow", () => {
  let orm;
  beforeEach(() => {
    orm = new Orm(initConfig);
  });
  test("insert data and find success", async () => {
    const model = await orm.model(initSchema);

    const data = model.build({
      status: 1,
    });
    data.time = new Date();
    data.browser = "chrome";
    data.browser_v = "90.0.1.21";
    await data.save();

    await model.create({
      status: 2,
      time: new Date(),
      browser: "safari",
      browser_v: "90.0.1.21",
    });

    await model.insertMany([
      {
        status: 3,
        time: new Date(),
        browser: "baidu",
        browser_v: "90.0.1.21",
      },
      {
        status: 4,
        time: new Date(),
        browser: "firefox",
        browser_v: "90.0.1.21",
      },
    ]);

    const res = await model.find({ select: "*", limit: 2 });

    expect(res.length).toBeLessThanOrEqual(2);
  });
});
