import React, { Context, useCallback, useContext, useState } from 'react';
import { ApiRx, WsProvider } from '@polkadot/api';
import type { Metadata } from '@polkadot/metadata';
import { keyring } from '@polkadot/ui-keyring';
import { zip } from 'rxjs';
import { BusContext } from './bus.provider';

interface Props {
  children: React.ReactNode;
  url?: string;
}

interface Endpoint {
  api: ApiRx;
  wsProvider: WsProvider;
  errorHandler: (...args: any[]) => any;
  readyHandler: (...args: any[]) => any;
  connectedHandler: (...args: any[]) => any;
  disconnectedHandler: (...args: any[]) => any;
}

const RPC_TYPES = {
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
};

const TYPES = {
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
};

function isKeyringLoaded () {
  try {
    return !!keyring.keyring;
  } catch {
    return false;
  }
}

export let api: ApiRx;

const ApiContext: Context<{
  api: ApiRx;
  genesisHash: string;
  tokenDecimal: number;
  tokenSymbol: string;
  systemName: string;
  wsProvider: WsProvider;
  metadata: Metadata;
  start: (wsPort: number) => void;
}> = React.createContext({} as any);

const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> {
  const { connected$ } = useContext(BusContext);
  const [ endpoint, setEndpoint ] = useState<Endpoint>();
  const [ {
    tokenDecimal,
    tokenSymbol,
    systemName,
    genesisHash,
    metadata,
  }, setProperties ] = useState<{
    tokenDecimal: number;
    tokenSymbol: string;
    systemName: string;
    genesisHash: string;
    metadata: Metadata;
  }>({} as any);

  const disconnect = useCallback(() => {
    if (!endpoint) {
      return;
    }

    try {
      endpoint.api.disconnect().catch(() => {});
    } catch (e) {}

    endpoint.api.off('ready', endpoint.readyHandler);
    endpoint.api.off('error', endpoint.errorHandler);
    endpoint.api.off('connected', endpoint.connectedHandler);
    endpoint.api.off('disconnected', endpoint.disconnectedHandler);

    setEndpoint(undefined);
  }, [endpoint]);

  const start = useCallback((wsPort: number) => {
    if (endpoint) {
      disconnect();
    }

    const domain = `ws://127.0.0.1:${wsPort}`;
    const wsProvider = new WsProvider(domain);
    const apiRx = new ApiRx({
      provider: wsProvider,
      rpc: RPC_TYPES,
      types: TYPES,
    });
    
    api = apiRx;
    const _endpoint: Endpoint = {
      api: apiRx,
      wsProvider,
      readyHandler: async (_api: ApiRx) => {
        console.log(`endpoint ${domain} ready`);

        const [ {
          ss58Format,
          tokenDecimals,
          tokenSymbol,
        },
          _systemName,
          metadata,
        ] = await zip(
          _api.rpc.system.properties(),
          _api.rpc.system.name(),
          _api.rpc.state.getMetadata(),
        ).toPromise();
        const decimals = tokenDecimals.toHuman() as string[];
  
        isKeyringLoaded() || keyring.loadAll({
          genesisHash: _api.genesisHash,
          ss58Format: parseInt(_api.consts.system?.ss58Prefix.toString() || ss58Format.toString()),
          type: 'sr25519',
          isDevelopment: true,
        });
  
        setProperties({
          systemName: _systemName.toString(),
          genesisHash: _api.genesisHash.toString(),
          tokenDecimal: parseInt(decimals[0]),
          tokenSymbol: tokenSymbol.toString(),
          metadata,
        });
        connected$.next(true);
      },
      connectedHandler() {
        console.log(`endpoint ${domain} connected`);
      },
      errorHandler(error) {
        console.log(`endpoint ${domain} error`, error);
      },
      disconnectedHandler() {
        console.log(`endpoint ${domain} disconnected`);

        connected$.next(false);
      }
    };

    apiRx.on('ready', _endpoint.readyHandler);
    apiRx.on('error', _endpoint.errorHandler);
    apiRx.on('connected', _endpoint.connectedHandler);
    apiRx.on('disconnected', _endpoint.disconnectedHandler);

    setEndpoint(_endpoint);
  }, [endpoint, disconnect, connected$]);

  return <ApiContext.Provider value={ {
    api,
    wsProvider: endpoint?.wsProvider as any,
    genesisHash,
    tokenDecimal,
    tokenSymbol,
    systemName,
    metadata,
    start,
  } }>{children}</ApiContext.Provider>;
});

export {
  ApiContext,
  ApiProvider,
};