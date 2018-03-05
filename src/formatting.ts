export type CaseFn = (str: string) => string;

export function formatGroup(str: string, format: (s: string, i: number) => string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, format).replace(/\s+/g, '');
}

export function lowerCase(str: string): string {
  return str.toLowerCase();
}

export function upperCase(str: string): string {
  return str.toUpperCase();
}

export function camelCase(str: string): string {
  return formatGroup(str, function(s: string, i: number) {
    return i === 0 ? s.toLowerCase() : s.toUpperCase();
  });
}

export function pascalCase(str: string): string {
  return formatGroup(str, function(s: string, i: number) {
    return s.toUpperCase();
  });
}
