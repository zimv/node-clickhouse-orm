export const isObject = (value) => {
    return Object.prototype.toString.apply(value) === '[object Object]';
  };