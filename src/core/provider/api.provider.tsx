import React, { Context, useEffect, useState } from 'react';
import { ApiRx, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { zip } from 'rxjs';

const ApiContext: Context<{
  api: ApiRx;
  isApiReady: boolean;
  genesisHash: string;
  tokenDecimal: number;
  tokenSymbol: string;
  systemName: string;
  wsProvider: WsProvider;
}> = React.createContext({
  isApiReady: false,
} as any);

interface Props {
  children: React.ReactNode;
  url?: string;
}

export let api: ApiRx;

const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> {
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ wsProvider, setWsProvider ] = useState<WsProvider>(undefined as any);
  const [ {
    tokenDecimal,
    tokenSymbol,
    systemName,
    genesisHash,
  }, setProperties ] = useState<{
    tokenDecimal: number;
    tokenSymbol: string;
    systemName: string;
    genesisHash: string;
  }>({} as any);

  useEffect(() => {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    // const wsProvider = new WsProvider('ws://192.168.2.142:9944');
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
        },
        contractsExt: {
          call: {
            description: '',
            params: [
              {
                name: 'callRequest',
                type: 'ContractCallRequest'
              },
              {
                name: 'at',
                type: 'BlockHash',
                isHistoric: true,
                isOptional: true
              }
            ],
            type: 'Bytes',
          }
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

    apiRx.on('ready', async (_api: ApiRx) => {
      console.log('api ready', _api);

      const [ {
        ss58Format,
        tokenDecimals,
        tokenSymbol,
      }, _systemName ] = await zip(
        _api.rpc.system.properties(),
        _api.rpc.system.name(),
      ).toPromise();

      keyring.loadAll({
        genesisHash: _api.genesisHash,
        ss58Format: parseInt(_api.consts.system?.ss58Prefix.toString() || ss58Format.toString()),
        type: 'sr25519',
        isDevelopment: true,
      });

      const decimals = tokenDecimals.toHuman() as string[];

      api = _api;
      setProperties({
        systemName: _systemName.toString(),
        genesisHash: _api.genesisHash.toString(),
        tokenDecimal: parseInt(decimals[0]),
        tokenSymbol: tokenSymbol.toString(),
      });
      setWsProvider(wsProvider);
      setIsReady(true);
    });
    apiRx.on('error', error => console.log('api error', error));
    apiRx.on('connected', () => console.log('api connected'));
    apiRx.on('disconnected', () => console.log('api disconnected'));
  }, []);

  return <ApiContext.Provider value={ {
    genesisHash,
    isApiReady,
    api,
    tokenDecimal,
    tokenSymbol,
    systemName,
    wsProvider,
  } }>{children}</ApiContext.Provider>;
});

export {
  ApiContext,
  ApiProvider,
};