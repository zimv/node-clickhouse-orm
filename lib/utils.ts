export const isObject = (value: any) => {
    return Object.prototype.toString.apply(value) === '[object Object]';
  };