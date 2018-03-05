import * as myLogger from '../../../index';
import { testTransport } from './sink';

const sink = myLogger.newFileSink({
  level: myLogger.levels.debug,
  formatter: function consoleFormatter(object: myLogger.ILogEvent): string {
    return JSON.stringify(object);
  },
  filename: './test.log',
});

testTransport('File', sink);
