import { expect } from 'chai';
import * as myLogger from '../../../index';
import { hookStream } from './utils';

export function testTransport(winstonTransport: string, sink: myLogger.ISink) {

  describe(`${winstonTransport} sink`, () => {

    let logger: myLogger.ILogger;
    let logs: Array<string>;
    let unhookStdout: () => void;

    before(() => {
      const config: myLogger.IConfig = {
        sinks: [sink],
      };

      logger = myLogger.newLogger(config);
    });

    beforeEach(() => {
      logs = [];
      unhookStdout = hookStream(winstonTransport, function(msg) {
        logs.push(msg);
      });
    });

    afterEach(() => {
      unhookStdout();
    });

    const testLogLevel = (level: string) => {
      it(`should log: ${level}`, () => {
        const message = 'msg';
        logger[level](message);
        expect(logs.length).to.equal(1);
        const expected: any = JSON.parse(logs[0]);
        expect(expected.level).to.equal(level);
        expect(expected.message).to.equal(message);
      });
    };

    (<any>Object).values(myLogger.levels).forEach(testLogLevel);
  });
}
