import { expect } from 'chai';
import * as myLogger from '../../../index';
import { hookStream } from './utils';

interface ITestData {
  desc: string;
  logMeta: any;
  assert: (expected: any) => void;
}

interface ICasingTestData extends ITestData {
  maskOptions: myLogger.IMaskerConfig;
}

describe(`Recursive masker`, () => {
  const cases = myLogger.cases;

  let logs: Array<string>;
  let unhookStdout: () => void;

  beforeEach(() => {
    logs = [];
    unhookStdout = hookStream('Console', function(msg) {
      logs.push(msg);
    });
  });

  afterEach(() => {
    unhookStdout();
  });

  it('should recursively mask object', () => {
    const config: myLogger.IConfig = {
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

    logger.debug('message', {
      validProp1: 'validProp1',
      nested: {
        validProp2: 'validProp2',
      },
    });

    expect(logs.length).to.equal(1);
    const expected: any = JSON.parse(logs[0]);
    expect(expected.meta.validProp1).to.equal('**scrubbed**');
    expect(expected.meta.nested.validProp2).to.equal('**scrubbed**');
  });

  function testArrays(testData: ITestData) {
    const { desc, logMeta, assert } = testData;
    it(`should recursively mask ${desc}`, () => {
      const config: myLogger.IConfig = {
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
            field: ['validProp1', 'validProp2', 'validProp3'],
            case: cases.camel,
            mask: '**scrubbed**',
          }),
        ],
      };

      const logger = myLogger.newLogger(config);

      logger.debug('message', logMeta);

      expect(logs.length).to.equal(1);
      const expected: any = JSON.parse(logs[0]);
      assert(expected.meta);
    });
  }

  const arrayTestCases = [
    {
      desc: 'nested array',
      logMeta: {
        validProp1: 'validProp1',
        items1: [
          {
            validProp2: 'validProp2',
            items2: [
              {
                validProp3: 'validProp3',
              },
            ],
          },
        ],
      },
      assert: (expected: any) => {
        expect(expected.validProp1).to.equal('**scrubbed**');
        const nested1 = expected.items1[0];
        expect(nested1.validProp2).to.equal('**scrubbed**');
        const nested2 = nested1.items2[0];
        expect(nested2.validProp3).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'root array',
      logMeta: [{
        validProp1: 'validProp1',
        items1: [
          {
            validProp2: 'validProp2',
            items2: [
              {
                validProp3: 'validProp3',
              },
            ],
          },
        ],
      }],
      assert: (expected: any) => {
        const nested1 = expected[0];
        expect(nested1.validProp1).to.equal('**scrubbed**');
        const nested2 = nested1.items1[0];
        expect(nested2.validProp2).to.equal('**scrubbed**');
        const nested3 = nested2.items2[0];
        expect(nested3.validProp3).to.equal('**scrubbed**');
      },
    },
  ] as Array<ITestData>;

  arrayTestCases.forEach(testArrays);

  function testMaskOptions(testData: ICasingTestData) {
    const { desc, maskOptions, logMeta, assert } = testData;

    it(`should recursively mask: ${desc}`, () => {
      const config: myLogger.IConfig = {
        sinks: [
          myLogger.newConsoleSink({
            level: myLogger.levels.debug,
            formatter: function consoleFormatter(object: myLogger.ILogEvent): string {
              return JSON.stringify(object);
            },
          }),
        ],
        maskers: [
          myLogger.newMasker(maskOptions),
        ],
      };

      const logger = myLogger.newLogger(config);

      logger.debug('message', logMeta);

      expect(logs.length).to.equal(1);
      const expected: any = JSON.parse(logs[0]);
      assert(expected.meta);
    });
  }

  const casingTestCases = [
    {
      desc: 'single field',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMeCamel',
        case: cases.camel,
      },
      logMeta: {
        scrubMeCamel: 'message',
        dontscrubme: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubMeCamel).to.equal('**scrubbed**');
        expect(expected.dontscrubme).to.equal('message');
      },
    },
    {
      desc: 'multiple fields',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMeCamel1', 'scrubMeCamel2'],
        case: cases.camel,
      },
      logMeta: {
        scrubMeCamel1: 'message',
        scrubMeCamel2: 'message',
        dontscrubme: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubMeCamel1).to.equal('**scrubbed**');
        expect(expected.scrubMeCamel2).to.equal('**scrubbed**');
        expect(expected.dontscrubme).to.equal('message');
      },
    },
    {
      desc: 'lower case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMe', 'dontScubMe'],
        case: cases.lower,
      },
      logMeta: {
        scrubme: 'message',
        dontScrubMe: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubme).to.equal('**scrubbed**');
        expect(expected.dontScrubMe).to.equal('message');
      },
    },
    {
      desc: 'upper case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMe', 'dontScubMe'],
        case: cases.upper,
      },
      logMeta: {
        SCRUBME: 'message',
        dontScrubMe: 'message',
      },
      assert: (expected: any) => {
        expect(expected.SCRUBME).to.equal('**scrubbed**');
        expect(expected.dontScrubMe).to.equal('message');
      },
    },
    {
      desc: 'camel case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMe', 'dontScubMe'],
        case: cases.camel,
      },
      logMeta: {
        scrubMe: 'message',
        dontScrubMe: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('**scrubbed**');
        expect(expected.dontScrubMe).to.equal('message');
      },
    },
    {
      desc: 'pascal case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMe', 'dontScubMe'],
        case: cases.pascal,
      },
      logMeta: {
        ScrubMe: 'message',
        dontScrubMe: 'message',
      },
      assert: (expected: any) => {
        expect(expected.ScrubMe).to.equal('**scrubbed**');
        expect(expected.dontScrubMe).to.equal('message');
      },
    },
    {
      desc: 'lower or upper case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMeLower', 'scrubMeUpper', 'dontScrubMe'],
        case: cases.lower | cases.upper,
      },
      logMeta: {
        scrubmelower: 'message',
        SCRUBMEUPPER: 'message',
        dontScrubMe: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubmelower).to.equal('**scrubbed**');
        expect(expected.SCRUBMEUPPER).to.equal('**scrubbed**');
        expect(expected.dontScrubMe).to.equal('message');
      },
    },
    {
      desc: 'camel or pascal case',
      maskOptions: {
        mask: '**scrubbed**',
        field: ['scrubMeCamel', 'scrubMePascal', 'dontScrubMe'],
        case: cases.camel | cases.pascal,
      },
      logMeta: {
        scrubMeCamel: 'message',
        ScrubMePascal: 'message',
        dontscrubme: 'message',
      },
      assert: (expected: any) => {
        expect(expected.scrubMeCamel).to.equal('**scrubbed**');
        expect(expected.ScrubMePascal).to.equal('**scrubbed**');
        expect(expected.dontscrubme).to.equal('message');
      },
    },
    {
      desc: 'positive rule',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        rule: (logMeta: any) => Boolean(logMeta.propertyExists),
      },
      logMeta: {
        scrubMe: 'message',
        propertyExists: true,
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('**scrubbed**');
        expect(expected.propertyExists).to.equal(true);
      },
    },
    {
      desc: 'negative rule',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        rule: (logMeta: any) => Boolean(logMeta.propertyExists),
      },
      logMeta: {
        scrubMe: 'message',
        propertyExists: false,
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.propertyExists).to.equal(false);
      },
    },
    {
      desc: 'nested target',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: 'nested',
      },
      logMeta: {
        scrubMe: 'message',
        nested: {
          scrubMe: 'message',
        },
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.nested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'nested target array',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: 'nested',
      },
      logMeta: [{
        scrubMe: 'message',
        nested: {
          scrubMe: 'message',
        },
      }],
      assert: (expected: any) => {
        expect(expected[0].scrubMe).to.equal('message');
        expect(expected[0].nested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'twice nested target',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: 'nested.nested',
      },
      logMeta: {
        scrubMe: 'message',
        nested: {
          scrubMe: 'message',
          nested: {
            scrubMe: 'message',
          },
        },
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.nested.scrubMe).to.equal('message');
        expect(expected.nested.nested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'twice nested target array',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: 'nested.nested',
      },
      logMeta: {
        scrubMe: 'message',
        nested: [{
          scrubMe: 'message',
          nested: {
            scrubMe: 'message',
          },
        }],
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.nested[0].scrubMe).to.equal('message');
        expect(expected.nested[0].nested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'multiple nested targets',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: ['nested.nested', 'otherNested.otherNested'],
      },
      logMeta: {
        scrubMe: 'message',
        nested: {
          scrubMe: 'message',
          nested: {
            scrubMe: 'message',
          },
        },
        otherNested: {
          scrubMe: 'message',
          otherNested: {
            scrubMe: 'message',
          },
        },
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.nested.scrubMe).to.equal('message');
        expect(expected.nested.nested.scrubMe).to.equal('**scrubbed**');
        expect(expected.otherNested.scrubMe).to.equal('message');
        expect(expected.otherNested.otherNested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'multiple nested targets w/ arrays',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        target: ['nested.nested', 'otherNested.otherNested'],
      },
      logMeta: {
        scrubMe: 'message',
        nested: {
          scrubMe: 'message',
          nested: {
            scrubMe: 'message',
          },
        },
        otherNested: [{
          scrubMe: 'message',
          otherNested: {
            scrubMe: 'message',
          },
        }],
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.nested.scrubMe).to.equal('message');
        expect(expected.nested.nested.scrubMe).to.equal('**scrubbed**');
        expect(expected.otherNested[0].scrubMe).to.equal('message');
        expect(expected.otherNested[0].otherNested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'nested target and positive rule',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        rule: (logMeta: any) => Boolean(logMeta.propertyExists),
        target: 'nested',
      },
      logMeta: {
        scrubMe: 'message',
        propertyExists: true,
        nested: {
          scrubMe: 'message',
        },
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.propertyExists).to.equal(true);
        expect(expected.nested.scrubMe).to.equal('**scrubbed**');
      },
    },
    {
      desc: 'nested target and negative rule',
      maskOptions: {
        mask: '**scrubbed**',
        field: 'scrubMe',
        case: cases.camel,
        rule: (logMeta: any) => Boolean(logMeta.propertyExists),
        target: 'nested',
      },
      logMeta: {
        scrubMe: 'message',
        propertyExists: false,
        nested: {
          scrubMe: 'message',
        },
      },
      assert: (expected: any) => {
        expect(expected.scrubMe).to.equal('message');
        expect(expected.propertyExists).to.equal(false);
        expect(expected.nested.scrubMe).to.equal('message');
      },
    },
  ] as Array<ICasingTestData>;

  casingTestCases.forEach(testMaskOptions);
});
