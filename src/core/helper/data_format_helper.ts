export const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const omitUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
};
