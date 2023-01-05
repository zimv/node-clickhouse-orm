import { insertSQL, object2Sql, deleteObject2Sql } from "../lib/transformer";
import { DATA_TYPE } from "../lib/data-type";

test('function insertSQL & UUID filter', () => {
  const schemaInstance = {
    columns: ["name", "age", "color", "uuid"],
    schemaConfig: {
      name: {type: DATA_TYPE.String},
      age: {type: DATA_TYPE.Int32},
      color: {type: DATA_TYPE.String},
      uuid: {type: DATA_TYPE.UUID},
    }
  };
  
  const tableName = "car";
  expect(insertSQL(tableName, schemaInstance as any)).toBe("INSERT INTO car (name,age,color)");
});

test("object2Sql car and condition can generate `SELECT name,age from car WHERE color='red' ORDER BY age DESC LIMIT 1,2`", () => {
  const condition = {
    select: "name,age",
    where: "color='red'",
    limit: 2,
    skip: 1,
    orderBy: "age DESC",
  };

  const table = "car";

  expect(object2Sql(table, condition)).toBe(
    "SELECT name,age from car WHERE color='red' ORDER BY age DESC LIMIT 1,2"
  );
});

test("object2Sql car and condition can generate `SELECT name,age from car WHERE color='red'`", () => {
  const condition = {
    select: "name,age",
    where: "color='red'",
  };

  const table = "car";

  expect(object2Sql(table, condition)).toBe(
    "SELECT name,age from car WHERE color='red'"
  );
});

test("deleteObject2Sql", () => {
  const condition = {
    where: "browser='Chrome'",
  };

  const table = "car";

  expect(deleteObject2Sql(table, condition)).toBe(
    "ALTER TABLE car  DELETE  WHERE browser='Chrome'"
  );
});

test("deleteObject2Sql custer", () => {
  const condition = {
    where: "browser='Chrome'",
    cluster: "cluster1",
  };

  const table = "car";

  expect(deleteObject2Sql(table, condition)).toBe(
    "ALTER TABLE car ON CLUSTER cluster1 DELETE  WHERE browser='Chrome'"
  );
});
