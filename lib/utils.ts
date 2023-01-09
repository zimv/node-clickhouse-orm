export const isObject = (value: any) => {
  return Object.prototype.toString.apply(value) === "[object Object]";
};
export const isObjectDate = (value: any) => {
  return Object.prototype.toString.apply(value) === "[object Date]";
};

/**
 * 
 * @param string 
 * @description Eliminate unnecessary spaces in data type strings to ensure accurate comparison
 * `Enum8('enum1' = 1, 'enum2' = 2, 'enum3' = 3)` -> `Enum8('enum1'=1,'enum2'=2,'enum3'=3)` 
 * @returns string 
 */
export const dataTypeFilterUnnecessarySpace = (str: string) => {
  return str.match(/(\S+)|(\'.+?\')/g).join("");
};
