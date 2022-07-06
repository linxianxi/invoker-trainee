export const isArrayEqual = (arr1: string[], arr2: string[]) =>
  arr1.length === arr2.length &&
  [...arr1].sort().toString() === [...arr2].sort().toString();
