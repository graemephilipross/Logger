export type Adapter = 'winston';

export type Adapters = {
  winston: Adapter,
};

export const adapters: Adapters = {
  winston: 'winston',
};

export type Level = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export type Levels = {
  verbose: Level,
  debug: Level,
  info: Level,
  error: Level,
};

export const levels: Levels = {
  verbose: 'verbose',
  debug: 'debug',
  info: 'info',
  error: 'error',
};

export type Lower = 1;
export type Upper = 2;
export type Camel = 4;
export type Pascal = 8;

export type Case = Lower | Upper | Camel | Pascal;

export type Cases = {
  lower: Lower,
  upper: Upper,
  camel: Camel,
  pascal: Pascal,
};

export const cases: Cases = {
  lower: 1,
  upper: 2,
  camel: 4,
  pascal: 8,
};
