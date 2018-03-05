import {
  logFactory,
  Logger,
  NullLogger,
} from './src/index';

import {
  FileSink,
  ConsoleSink,
} from './src/sinks';

// types
export {
  Adapter,
  adapters,
  Level,
  levels,
  Case,
  cases,
} from './src/types';

export { ISink,
  IFileSink,
  ILogEvent,
  Formatter,
  ISinkConfig,
  IFileSinkConfig,
  IFormatterConfig,
  IConsoleFormatterConfig,
  newConsoleSink,
  newFileSink,
} from './src/sinks';

export { IMasker, IMaskerConfig, Scrubber, newMasker } from './src/masks';
export { IConfig, ILogger, Logger, NullLogger } from './src/index';

// factory
export const newLogger = logFactory(Logger);
export const newNullLogger = logFactory(NullLogger);
