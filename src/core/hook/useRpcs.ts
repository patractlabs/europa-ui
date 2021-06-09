import { useMemo, useContext } from 'react';
import type { Text } from '@polkadot/types';
import type { RuntimeVersion } from '@polkadot/types/interfaces';
import type { DefinitionRpc, DefinitionRpcExt, Registry } from '@polkadot/types/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { getSpecRpc } from '@polkadot/types-known';
import { ApiContext } from '../provider';

function toExt (section: string, input: Record<string, DefinitionRpc>): Record<string, DefinitionRpcExt> {
  return Object.entries(input).reduce((output: Record<string, DefinitionRpcExt>, [method, def]): Record<string, DefinitionRpcExt> => {
    output[method] = {
      isSubscription: false,
      jsonrpc: `${method}_${section}`,
      method,
      section,
      ...def
    };

    return output;
  }, {});
}

function getAllRpc (registry: Registry, chain: Text, { specName }: RuntimeVersion): Record<string, Record<string, DefinitionRpcExt>> {
  return Object
    .entries(getSpecRpc(registry, chain, specName))
    .reduce((all: Record<string, Record<string, DefinitionRpcExt>>, [section, contents]): Record<string, Record<string, DefinitionRpcExt>> => {
      all[section] = toExt(section, contents);

      return all;
    }, { ...jsonrpc });
}

export function useRpcs (): Record<string, Record<string, DefinitionRpcExt>> {
  const { api } = useContext(ApiContext);

  return useMemo(
    () => getAllRpc(api.registry, api.runtimeChain, api.runtimeVersion),
    [api]
  );
}
