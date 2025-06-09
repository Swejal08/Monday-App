const getMultiple = (value: number, factor: number) =>
  Math.round(value * factor * 100) / 100;

export { getMultiple };
