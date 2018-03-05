// tslint:disable:no-empty

import { Level, Adapter, adapters, Adapters } from './types';
import { ISink } from './sinks';
import { IMasker } from './masks';

import { IAdapter } from './adapters/types';
import { winstonAdapter } from './adapters/winston';

type Cache<Key extends Adapter> = {[K in Key]: IAdapter};
const adapterCache = <Cache<Adapter>>{
  [adapters.winston]: winstonAdapter,
};

function newAdapter(options: IConfig): any {
  const adapterType = options.adapter || adapters.winston;
  const adapter = adapterCache[adapterType];

  const sinks = (options.sinks || []).map(s => {
    return s.match({
      ConsoleSink: adapter.newConsoleSink,
      FileSink: adapter.newFileSink,
    });
  });

  const maskers = (options.maskers || []).map(
    adapter.newMasker,
  );

  return adapter.newLogger(sinks, maskers);
}

export interface IConfig {
  sinks: ISink[];
  maskers?: IMasker[];
  adapter?: Adapter;
}

export interface ILogger {
  error(msg: string, err: any);
  warn(msg: string, target: any);
  info(msg: string, target: any);
  debug(msg: string, target: any);
  verbose(msg: string, target: any);
}

export class Logger implements ILogger {
  private _logger: any;

  constructor(private options: IConfig) {
    this._logger = newAdapter(options);
  }

  public error(msg: string, err: any) {
    this._logger.error(msg, err);
  }
  public warn(msg: string, target: any) {
    this._logger.warn(msg, target);
  }
  public info(msg: string, target: any) {
    this._logger.info(msg, target);
  }
  public debug(msg: string, target: any) {
    this._logger.debug(msg, target);
  }
  public verbose(msg: string, target: any) {
    this._logger.verbose(msg, target);
  }
}

export class NullLogger implements ILogger {
  public error(msg: string, err: any) { }
  public warn(msg: string, target: any) { }
  public info(msg: string, target: any) { }
  public debug(msg: string, target: any) { }
  public verbose(msg: string, target: any) { }
}

export interface NewableILogger<T> { new(options: IConfig): T; }
export type logFactory = (options: IConfig) => ILogger;

export function logFactory<T extends ILogger>(logger: NewableILogger<T>): logFactory {
  return function (options: IConfig): ILogger {
    return new logger(options);
  };
}
