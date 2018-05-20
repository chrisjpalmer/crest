String.prototype.replaceAll = function(
  this: string,
  search: string,
  replacement: string,
): string {
  return this.split(search).join(replacement);
};
