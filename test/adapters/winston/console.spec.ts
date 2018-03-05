import * as myLogger from '../../../index';
import { testTransport } from './sink';

const sink = myLogger.newConsoleSink({
  level: myLogger.levels.debug,
  formatter: function consoleFormatter(object: myLogger.ILogEvent, config: myLogger.IConsoleFormatterConfig): string {
    return config.colorize(object.level, JSON.stringify(object));
  },
});

testTransport('Console', sink);
