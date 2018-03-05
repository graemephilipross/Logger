import { expect } from 'chai';
import * as myLogger from '../../index';

describe(`Adapters`, () => {
  const cases = myLogger.cases;

  const testLogAdapter = (adapter: myLogger.Adapter) => {
    it(`should construct logger for: ${adapter}`, () => {
      const config: myLogger.IConfig = {
        adapter,
        sinks: [
          myLogger.newConsoleSink({
            level: myLogger.levels.debug,
            formatter: function consoleFormatter(object: myLogger.ILogEvent): string {
              return JSON.stringify(object);
            },
          }),
        ],
        maskers: [
          myLogger.newMasker({
            field: ['validProp1', 'validProp2'],
            case: cases.camel,
            mask: '**scrubbed**',
          }),
        ],
      };

      const logger = myLogger.newLogger(config);
      // tslint:disable-next-line:no-unused-expression
      expect(logger).to.exist;
    });
  };

  (<any>Object).values(myLogger.adapters).forEach(testLogAdapter);
});
