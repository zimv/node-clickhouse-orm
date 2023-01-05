import { isObject, isObjectDate, dataTypeFilterUnnecessarySpace } from "../lib/utils";

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

test("dataTypeFilterUnnecessarySpace(string)", () => {
  expect(
    dataTypeFilterUnnecessarySpace(
      `Enum16('enum30000' = 30000, 'enum30100' = 30100, 'enum30200' = 30200)`
    )
  ).toBe("Enum16('enum30000'=30000,'enum30100'=30100,'enum30200'=30200)");

  expect(
    dataTypeFilterUnnecessarySpace(
      `Array( String )`
    )
  ).toBe("Array(String)");
  
});
