import React, { Context, useContext, useEffect, useState } from 'react';
import { of, zip } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import type { KeyringPair$Meta } from '@polkadot/keyring/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import { formatBalance } from '@polkadot/util';
import { ApiContext } from './api.provider';

interface AccountJson extends KeyringPair$Meta {
  address: string;
  genesisHash?: string | null;
  isExternal?: boolean;
  isHardware?: boolean;
  isHidden?: boolean;
  name?: string;
  parentAddress?: string;
  suri?: string;
  type?: KeypairType;
  whenCreated?: number;
}

export type AccountInfo = AccountJson & { balance: string; mnemonic: string };
interface AccountsContextProps {
  accounts: AccountInfo[];
}

export const AccountsContext: Context<AccountsContextProps> = React.createContext({}as unknown as AccountsContextProps);


function transformAccounts (accounts: SubjectInfo): AccountJson[] {
  return Object.values(accounts).map(({ json: { address, meta }, type }): AccountJson => ({
    address,
    ...meta,
    type
  }));
}

export const AccountsProvider = React.memo(({ children }: { children: React.ReactNode }): React.ReactElement => {
    const { api, tokenDecimal, isApiReady } = useContext(ApiContext);
    const [ accounts, setAccounts ] = useState<AccountInfo[]>([]);

    useEffect(() => {
      if (!isApiReady) { 
        return;
      }

      const sub = accountsObservable.subject.pipe(
        map(accounts => transformAccounts(accounts)),
        mergeMap(accounts =>
          zip(
            ...accounts.map(keyringAccount =>
              api.derive.balances?.all(keyringAccount.address).pipe(
                map(accountInfo => ({
                  ...keyringAccount,
                  balance: formatBalance(accountInfo.freeBalance.toString(), {}, tokenDecimal),
                  mnemonic: localStorage.getItem(`mnemonic${keyringAccount.address}`) || '',
                })),
                catchError(() => of({
                  ...keyringAccount,
                  balance: '0',
                  mnemonic: localStorage.getItem(`mnemonic${keyringAccount.address}`) || '',
                })),
              )
            )        
          )
        ),
      ).subscribe((accounts) => {
        accounts = accounts.filter((account) => !!account);
        setAccounts(accounts);
        console.log('Stored Accounts:', accounts);
      }, e => console.log('eee', e));
  
      return () => sub.unsubscribe();
    }, [api, tokenDecimal, isApiReady]);

    return <AccountsContext.Provider value={{
      accounts
    }}>{children}</AccountsContext.Provider>;
  }
);
