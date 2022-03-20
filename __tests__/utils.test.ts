import { isObject, isObjectDate } from "../lib/utils";

// isObject
test("cat is object", () => {
  const cat = {
    name: "kitty",
    age: 2,
  };

  expect(isObject(cat)).toBeTruthy();
});
test("name is not object", () => {
  const name = "buddy";

  expect(isObject(name)).toBeFalsy();
});

// isObjectDate
test("today is object date", () => {
  const today = new Date();

  expect(isObjectDate(today)).toBeTruthy();
});
test("age is not object date", () => {
  const age = 42;

  expect(isObjectDate(age)).toBeFalsy();
});
