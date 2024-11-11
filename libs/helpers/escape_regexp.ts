export const escape_regexp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
