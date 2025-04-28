export const isSafePopulateField = <T extends readonly string[]>(
  field: string,
  allowedFields: T
): field is T[number] => {
  return allowedFields.includes(field as T[number]);
};

export function typedObjectEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
