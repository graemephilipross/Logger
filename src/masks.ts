import * as f from './formatting';
import { getObjectPath } from './utils';
import { Level, Case, cases } from './types';

interface IFieldMaskerConfig {
  field: string|string[];
  case: Case;
  mask: string;
}

export type Scrubber = <T>(level: Level, message: string, object: T) => T;

export interface IMasker {
  scrubber: Scrubber;
}

class TargetFieldsMasker implements IMasker {
  constructor(private targetPaths: string|string[], private masker: IMasker) { }

  public scrubber<T>(level: Level, message: string, object: T): T {
    [].concat(this.targetPaths).forEach(path => {
      const target = getObjectPath(object, path);
      this.masker.scrubber<T>(level, message, target);
    });
    return object;
  }
}

class RuleFieldsMasker implements IMasker {
  constructor(private rule: (object: any) => boolean, private masker: IMasker) { }

  public scrubber<T>(level: Level, message: string, object: T): T {
    if (this.rule(object)) {
      return this.masker.scrubber<T>(level, message, object);
    }
    return object;
  }
}

class RecursiveFieldsMasker implements IMasker {
  private keySelector: { [id: number]: f.CaseFn } = {};

  constructor(private fieldSelector: IFieldMaskerConfig) {
    this.keySelector[cases.lower] = f.lowerCase;
    this.keySelector[cases.upper] = f.upperCase;
    this.keySelector[cases.camel] = f.camelCase;
    this.keySelector[cases.pascal] = f.pascalCase;
  }

  public scrubber<T>(level: Level, message: string, object: T): T {
    const { case: fieldCase, field: fieldList, mask } = this.fieldSelector;

    // get all relevant case functions
    const formatters = Object.values(cases).reduce((acc, c) => {
      if (fieldCase & c) {
        acc = [...acc, this.keySelector[c]];
      }
      return acc;
    }, <Array<f.CaseFn>>[]);

    return this.scrub(formatters, [].concat(fieldList), mask)(object);
  }

  private scrub(formatters: f.CaseFn[], fields: string[], mask: string): (obj: any) => any {
    return function walk(obj: any): any {
      const newObj = obj;
      Object.entries(newObj || {}).forEach(([key, value]) => {
        // do any fields (case func applied) contain key
        const anyFormatMatch = formatters.reduce((acc, fn) => {
          return acc |= +fields.map(fn).includes(key);
        }, 0);

        if (anyFormatMatch) {
          newObj[key] = mask;
        } else if (typeof value === 'object') {
          newObj[key] = walk(value);
        }
      });

      return newObj;
    };
  }
}

export interface IMaskerConfig {
  target?: string|string[];
  rule?: (object: any) => boolean;
  field: string|string[];
  case: Case;
  mask: string;
}

export function newMasker(options: IMaskerConfig): IMasker {
  const { field, case: c, mask, target, rule } = options;
  const base: IMasker = new RecursiveFieldsMasker({ mask, field, case: c });
  const targetDecorated = new TargetFieldsMasker(target || '.', base);
  const ruleDecorated = new RuleFieldsMasker(rule || ((obj: any) => true), targetDecorated);
  return ruleDecorated;
}
