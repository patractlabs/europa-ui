import React, { Context, useEffect, useState } from 'react';
import { ApiRx, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';

const ApiContext: Context<{
  api: ApiRx;
  isApiReady: boolean;
  genesisHash: string;
  tokenDecimal: number;
  tokenSymbol: string;
}> = React.createContext({
  isApiReady: false,
  genesisHash: '',
} as any);

interface Props {
  children: React.ReactNode;
  url?: string;
}
const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> {
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ api, setApi ] = useState<ApiRx>();
  const [ token, setToken ] = useState<{tokenDecimal: number; tokenSymbol: string;}>({tokenDecimal: 10, tokenSymbol: ''});
  const [ genesisHash, setGenesisHash ] = useState<string>('');

  useEffect(() => {
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

    apiRx.on('ready', (_api: ApiRx) => {
      console.log('api ready', _api);
      _api.rpc.system.properties().subscribe(property => {
        console.log('property', property.toHuman())
        // load all available addresses and accounts
        keyring.loadAll({
          genesisHash: _api.genesisHash,
          ss58Format: parseInt(property.ss58Format.toString()),
          type: 'sr25519',
          isDevelopment: true,
        });
        console.log('load all', keyring.getAccounts(), _api.consts.system?.ss58Prefix.toNumber())
        // additional initialization here, including rendering
        const decimals = property.tokenDecimals.toHuman() as string[];

        setGenesisHash(_api.genesisHash.toString());
        setToken({
          tokenDecimal: parseInt(decimals[0]),
          tokenSymbol: property.tokenSymbol.toString(),
        });
        setApi(_api);
        setIsReady(true);
      });
    });
    apiRx.on('error', (error: Error) => console.log('api error', error));
    apiRx.on('connected', () => console.log('api connected'));
    apiRx.on('disconnected', () => console.log('api disconnected'));
  }, []);

  return <ApiContext.Provider value={ {
    genesisHash,
    isApiReady,
    api: api as ApiRx,
    tokenDecimal: token?.tokenDecimal,
    tokenSymbol: token?.tokenSymbol,
  } }>{children}</ApiContext.Provider>;
});

export {
  ApiContext,
  ApiProvider,
};