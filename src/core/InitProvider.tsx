import React, { useEffect, useState } from 'react';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const InitContext: React.Context<any> = React.createContext(({} as unknown));

export const InitProvider = React.memo(function Api({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ isReady, setIsReady ] = useState<boolean>(false);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      // load all available addresses and accounts
      keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
      setIsReady(true);
      // additional initialization here, including rendering
    });
  }, []);

  return <InitContext.Provider value={{ isReady }}>{children}</InitContext.Provider>;
});
