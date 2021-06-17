import React, { Context, useEffect, useState } from 'react';
import { ApiRx, WsProvider } from '@polkadot/api';
import type { Metadata } from '@polkadot/metadata';
import keyring from '@polkadot/ui-keyring';
import { zip } from 'rxjs';
import { requireModule } from '../../shared';
import type * as ChildProcess from 'child_process';
import type * as Path from 'path';
import type * as FS from 'fs';
import type * as OS from 'os';

const ApiContext: Context<{
  api: ApiRx;
  isApiReady: boolean;
  genesisHash: string;
  tokenDecimal: number;
  tokenSymbol: string;
  systemName: string;
  wsProvider: WsProvider;
  metadata: Metadata;
  europa?: ChildProcess.ChildProcessWithoutNullStreams;
}> = React.createContext({
  isApiReady: false,
} as any);

interface Props {
  children: React.ReactNode;
  url?: string;
}

export let api: ApiRx;

const startEuropa = () => {
  if (!requireModule.isElectron) {
    return;
  }

  try {
    const childProcess: typeof ChildProcess = requireModule('child_process');
    const path: typeof Path = requireModule('path');
    const fs: typeof FS = requireModule('fs');
    const os: typeof OS = requireModule('os');
    const platform = os.platform().toLowerCase();
    let binPath = path.resolve(__dirname, '../../app.asar.unpacked/resources', 'europa-win.exe');

    if (platform === 'linux') {
      binPath = path.resolve(__dirname, '../../app.asar.unpacked/resources', 'europa');
    } else if (platform === 'darwin') {
      binPath = path.resolve(__dirname, '../../app.asar.unpacked/resources', 'europa-darwin');
    }

    console.log(`platform:`, platform);
    console.log(`bin:`, binPath);
    console.log(`dir:`, __dirname);
    console.log('files:', fs.readdirSync(path.resolve(__dirname)));
    console.log('files:', fs.readdirSync(path.resolve(__dirname, '../')));
    console.log('files:', fs.readdirSync(path.resolve(__dirname, '../../')));
  
    return childProcess.spawn(binPath);
  } catch(e) {
    console.log('eeeeeeeeeee', e);
  }
}

const ApiProvider = React.memo(function Api({ children }: Props): React.ReactElement<Props> {
  const [ isApiReady, setIsReady ] = useState<boolean>(false);
  const [ europa, setEuropa ] = useState<ChildProcess.ChildProcessWithoutNullStreams>();
  const [ wsProvider, setWsProvider ] = useState<WsProvider>(undefined as any);
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

  useEffect(() => {
    const europa = startEuropa();
    setEuropa(europa);

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
      console.log('api ready!');

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

      keyring.loadAll({
        genesisHash: _api.genesisHash,
        ss58Format: parseInt(_api.consts.system?.ss58Prefix.toString() || ss58Format.toString()),
        type: 'sr25519',
        isDevelopment: true,
      });

      // console.log('metadata', metadata.keys(), metadata.values(), metadata.toHuman(), metadata.toJSON(), metadata.asV13, metadata.get('modules'), metadata.getAtIndex(0))
      const decimals = tokenDecimals.toHuman() as string[];
      api = _api;
      setProperties({
        systemName: _systemName.toString(),
        genesisHash: _api.genesisHash.toString(),
        tokenDecimal: parseInt(decimals[0]),
        tokenSymbol: tokenSymbol.toString(),
        metadata,
      });
      setWsProvider(wsProvider);
      setIsReady(true);
    });
    apiRx.on('error', error => console.log('api error!', error));
    apiRx.on('connected', () => console.log('api connected!'));
    apiRx.on('disconnected', () => console.log('api disconnected!'));
  }, []);

  return <ApiContext.Provider value={ {
    genesisHash,
    isApiReady,
    api,
    tokenDecimal,
    tokenSymbol,
    systemName,
    wsProvider,
    metadata,
    europa,
  } }>{children}</ApiContext.Provider>;
});

export {
  ApiContext,
  ApiProvider,
};