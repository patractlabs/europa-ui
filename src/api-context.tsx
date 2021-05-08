import React, { Context, useEffect, useState } from 'react';
import { ApiRx, WsProvider } from '@polkadot/api';

const ApiContext: Context<{
  api: ApiRx;
  isApiReady: boolean;
}> = React.createContext({
  isApiReady: false,
} as any);

interface Props {
  children: React.ReactNode;
  url?: string;
}
const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> {
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ api, setApi ] = useState<ApiRx>();


  useEffect(() => {
    console.log('effect ');
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const apiRx = new ApiRx({
      provider: wsProvider,
      rpc: {
        europa: {
          forwardToHeight: {
            description: '',
            params: [
              {
                name: 'height',
                type: 'u32',
              }
            ],
            type: 'Bytes',
          },
          backwardToHeight: {
            description: '',
            params: [
              {
                name: 'height',
                type: 'u32',
              }
            ],
            type: 'Bytes',
          },
        }
      },
      types: {
        "LookupSource": "MultiAddress",
        "Address": "MultiAddress",
        "AliveContractInfo": {
          "trieId": "TrieId",
          "storageSize": "u32",
          "pairCount": "u32",
          "codeHash": "CodeHash",
          "rentAllowance": "Balance",
          "rentPayed": "Balance",
          "deductBlock": "BlockNumber",
          "lastWrite": "Option<BlockNumber>",
          "_reserved": "Option<Null>"
        }
      },
    });

    apiRx.on('ready', _api => {
      console.log('api ready', _api);
      setApi(_api);
      setIsReady(true);
    });
    apiRx.on('error', (error: Error) => console.log('api error', error));
    apiRx.on('connected', () => console.log('api connected'));
    apiRx.on('disconnected', () => console.log('api disconnected'));
  }, []);

  return <ApiContext.Provider value={ {
    isApiReady,
    api: api as ApiRx,
  } }>{children}</ApiContext.Provider>;
});

export {
  ApiContext,
  ApiProvider,
};