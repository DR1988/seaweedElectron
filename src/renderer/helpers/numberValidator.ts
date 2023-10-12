const decimalNumber = /[-+]?[0-9]+\.([0-9]+)*/;

export const isDecimalNumber = (value: string) => {
  return !isNaN(Number(value)) || decimalNumber.test(value);
};

export const isNumber = (value: string) => {
  return !isNaN(Number(value));
};
