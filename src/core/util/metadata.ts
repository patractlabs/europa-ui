import type { DispatchError } from '@polkadot/types/interfaces';
import type { Metadata } from '@polkadot/metadata';

type Module = {
  name: string;
  events: {
    name: string;
    args: string[];
    documantion: string;
  }[];
  errors: {
    name: string,
    documentation: string[],
  }[];
};
export interface TxErrorDesc {
  section: string;
  error: {
    name: string;
    documentation: string[];
  }
}

export const getDispatchError = (metadata: Metadata, error: DispatchError): TxErrorDesc => {
  let modules: Module[] = [];

  try {
    modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
  } catch (e) {
    console.log('eeeeeeeeee', e)
  }
  
  console.log('error.asModule.index.toNumber()', error.asModule.index.toNumber(), modules);
  return {
    section: modules[error.asModule.index.toNumber()].name,
    error: modules[error.asModule.index.toNumber()].errors[error.asModule.error.toNumber()],
  }
};