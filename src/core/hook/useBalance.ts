import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';

export const useBalance = (api: ApiRx, address: string) => {
  const [ balance, setBalance ] = useState<number>(0);

  useEffect(() => {
    const sub = api.derive.balances?.all(address).subscribe(accountInfo =>
      setBalance(accountInfo.freeBalance.toNumber())
    );

    return () => sub.unsubscribe();
  }, [api, address]);

  return { balance };
}