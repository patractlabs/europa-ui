import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';
import type { Balance } from '@polkadot/types/interfaces';

export const useBalance = (api: ApiRx, address: string) => {
  const [ balance, setBalance ] = useState<Balance>();

  useEffect(() => {
    const sub = api.derive.balances?.all(address).subscribe(accountInfo =>
      setBalance(accountInfo.freeBalance)
    );

    return () => sub.unsubscribe();
  }, [api, address]);

  return { balance };
}