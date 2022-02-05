export const isObject = (value: any) => {
  return Object.prototype.toString.apply(value) === '[object Object]';
};
export const isObjectDate = (value: any) => {
  return Object.prototype.toString.apply(value) === '[object Date]';
};