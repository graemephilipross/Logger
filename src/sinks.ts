import { Level } from './types';

export interface ILogEvent {
  level: Level;
  message: string;
  meta: any;
  timestamp(): string;
}

export interface IFormatterConfig {}
export interface IConsoleFormatterConfig extends IFormatterConfig {
  colorize: (level: Level, msg: string) => string;
}

export type Formatter = (object: ILogEvent, config?: IFormatterConfig) => string;

export interface ISink {
  level: Level;
  formatter: Formatter;
  match(pattern: IConfigPattern): any;
  timestamp(): string;
}

export interface IFileSink extends ISink {
  filename: string;
}

export interface IConfigPattern {
  FileSink: (sink: IFileSink) => any;
  ConsoleSink: (sink: ISink) => any;
}

export abstract class BaseSinkConfig  {
  constructor(public level: Level, public formatter: Formatter) {}

  public timestamp(): string {
    return new Date().toISOString();
  }

  public abstract match(p: IConfigPattern): any;
}

export class ConsoleSink extends BaseSinkConfig implements ISink {
  constructor(level: Level, public formatter: Formatter, public colorize?: boolean) {
    super(level, formatter);
  }

  public match(p: IConfigPattern): any {
    return p.ConsoleSink(this);
  }
}

export class FileSink extends BaseSinkConfig implements IFileSink {
  constructor(level: Level, public formatter: Formatter, public filename: string) {
    super(level, formatter);
  }

  public match(p: IConfigPattern): any {
    return p.FileSink(this);
  }
}

export interface ISinkConfig {
  level: Level;
  formatter: Formatter;
}

export interface IConsoleSinkConfig extends ISinkConfig {
  colorize?: boolean;
}

export interface IFileSinkConfig extends ISinkConfig {
  filename: string;
}

export function newConsoleSink(options: IConsoleSinkConfig) {
  const { level, formatter, colorize = false } = options;
  return new ConsoleSink(level, formatter, colorize);
}

export function newFileSink(options: IFileSinkConfig) {
  const { level, formatter, filename } = options;
  return new FileSink(level, formatter, filename);
}
