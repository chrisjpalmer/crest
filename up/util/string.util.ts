export function replaceAll (
  target: string,
  search: string,
  replacement: string,
): string {
  return target.split(search).join(replacement);
};
