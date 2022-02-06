export function toggleEntry<T>(array: T[] | undefined, entry: T, toInclude?: boolean): T[] {
  const included = toInclude === undefined ? array?.includes(entry) : !toInclude;
  return included ? array?.filter((e) => e !== entry) || [] : [...(array || []), entry];
}
