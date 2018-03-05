import * as winston from 'winston';

import { IAdapter } from './types';

import { Level } from '../types';
import { ISink, IFileSink, ILogEvent, IFormatterConfig, IConsoleFormatterConfig } from '../sinks';
import { IMasker } from '../masks';

export const winstonAdapter: IAdapter = {
  newFileSink(sink: IFileSink) {
    return new (winston.transports.File) ({
      prettyPrint: true,
      colorize: true,
      json: false,
      level: sink.level,
      formatter: (object: ILogEvent) => {
        return sink.formatter(object, <IFormatterConfig>{
        });
      },
      filename: sink.filename,
      timestamp: sink.timestamp,
    });
  },
  newConsoleSink(sink: ISink) {
    return new (winston.transports.Console) ({
      prettyPrint: true,
      colorize: true,
      level: sink.level,
      formatter: (object: ILogEvent) => {
        return sink.formatter(object, <IConsoleFormatterConfig>{
          colorize: winston.config.colorize,
        });
      },
      timestamp: sink.timestamp,
    });
  },
  newMasker(masker: IMasker) {
    return (level, msg, meta) => {
      return masker.scrubber(level, msg, meta);
    };
  },
  newLogger(sinks: ISink[], maskers: IMasker[]) {
    return new (winston.Logger)({
      transports: sinks,
      rewriters: maskers,
    });
  },
};
