import { useContext, useState, useEffect } from 'react';
import { SettingContext } from '../provider';
import { useRedspotContracts } from './useRedspotContracts';
import { store } from '../store/store';
import type { Abi } from '@polkadot/api-contract';

export const useAbi = (codeHash: string, signal?: number) => {
  const [ name, setName ] = useState<string>();
  const [ abi, setAbi ] = useState<Abi>();
  const { setting, choosed } = useContext(SettingContext);
  const { redspotContracts } = useRedspotContracts(
    setting.databases
      .find(db => db.path === choosed.database)?.workspaces
      .find(w => w.name === choosed.workspace)?.redspots || []
  );

  useEffect(() => {
    store.loadAll();

    const code = store.getCode(codeHash);

    if (code) {
      setAbi(code.contractAbi);
      setName(code.json.name);
    } else {
      const code = redspotContracts.find(code => code.codeHash === codeHash);

      setAbi(code?.abi);
      setName(code?.name);
    }
  }, [codeHash, signal, redspotContracts]);
  
  return { abi, name };
}