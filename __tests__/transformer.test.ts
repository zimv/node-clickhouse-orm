import { insertSQL, object2Sql } from "../lib/transformer";

test('insertSQL car and ["name", "age", "color"] can generate "INSERT INTO car (name,age,color)"', () => {
  const column = ["name", "age", "color"];

  const table = "car";

  expect(insertSQL(table, column)).toBe("INSERT INTO car (name,age,color)");
});

test("object2Sql car and condition can generate `SELECT name,age from car where color=red ORDER BY age DESC LIMIT 1,2`", () => {
  const condition = {
    select: "name,age",
    where: "color=red",
    limit: 2,
    skip: 1,
    orderBy: "age DESC",
  };

  const table = "car";

  expect(object2Sql(table, condition)).toBe(
    "SELECT name,age from car where color=red ORDER BY age DESC LIMIT 1,2"
  );
});

test("object2Sql car and condition can generate `SELECT name,age from car where color=red`", () => {
  const condition = {
    select: "name,age",
    where: "color=red",
  };

  const table = "car";

  expect(object2Sql(table, condition)).toBe(
    "SELECT name,age from car where color=red"
  );
});
