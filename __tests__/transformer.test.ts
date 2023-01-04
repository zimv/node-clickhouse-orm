import { insertSQL, object2Sql, deleteObject2Sql } from "../lib/transformer";

test('insertSQL car and ["name", "age", "color"] can generate "INSERT INTO car (name,age,color)"', () => {
  const column = ["name", "age", "color"];

  const table = "car";

  expect(insertSQL(table, column)).toBe("INSERT INTO car (name,age,color)");
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
