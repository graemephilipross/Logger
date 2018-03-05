import { Level } from '../types';
import { IFileSink, ISink, newConsoleSink } from '../sinks';
import { IMasker } from '../masks';

export interface IAdapter {
  newFileSink(sink: IFileSink): any;
  newConsoleSink(sink: ISink): any;
  newMasker(masker: IMasker): any;
  newLogger(sinks: IFileSink[], maskers: IMasker[]): any;
}
