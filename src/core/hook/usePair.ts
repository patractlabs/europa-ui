import { useContext } from 'react';
import { AccountsContext } from './../provider/accounts.provider';
import keyring from '@polkadot/ui-keyring';

export const usePair = (address: string) => {
  const { accounts } = useContext(AccountsContext);

  const account = accounts.find(account => account.address === address);
  if (!account) {
    return
  }
  
  return account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);
}