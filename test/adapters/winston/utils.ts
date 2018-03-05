import * as winston from 'winston';
import * as winstonCommon from 'winston/lib/winston/common';

export function hookStream(winstonTransport: string, fn: (msg: string) => void): () => void {
  const oldLog = (<any>winston).transports[winstonTransport].prototype.log;

  (<any>winston).transports[winstonTransport].prototype.log = function (level, message, meta, callback) {
    let output = winstonCommon.log(Object.assign({}, this, {
      level: level,
      message: message,
      meta: meta,
    }));

    // strip ANSI color codes
    output = output.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '',
    );

    fn(output);
    setImmediate(callback, null, true);
  };

  return function() {
    (<any>winston).transports[winstonTransport].prototype.log = oldLog;
  };
}
