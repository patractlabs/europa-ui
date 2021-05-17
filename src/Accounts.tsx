import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { KeyringPair$Meta } from '@polkadot/keyring/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import { Modal } from 'antd';
import { CreateAccount } from './CreateAccount';
import { ApiContext } from './core/provider/api-provider';
import keyring from '@polkadot/ui-keyring';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of, zip } from 'rxjs';

const Wrapper = styled.div`
  padding: 5px 15px;
`;

const ButtonGroup = styled.div`
  padding: 10px 20px;
`;

const Button = styled.button`
  cursor: pointer;
  padding: 2px 12px;
`;

const AccountsArea = styled.div`
  border: 1px solid gray;
  padding: 5px 10px;
`;

const AccountList = styled.div`

`;

const AccountListTitle = styled.h4`

`;
const AccountWrap = styled.div`
  display: flex;
`;

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

function transformAccounts (accounts: SubjectInfo): AccountJson[] {
  return Object.values(accounts).map(({ json: { address, meta }, type }): AccountJson => ({
    address,
    ...meta,
    type
  }));
}

type AccountInfo = AccountJson & { balance: string; mnemonic: string; };

const Account: FC<{
  account: AccountInfo;
}> = ({ account }): ReactElement => {

  const onDelete = () => {
    keyring.forgetAccount(account.address);
  }

  return (
    <AccountWrap>
      <div>name: {account.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div>Address: {account.address}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div>Balance: {account.balance}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div>mnemonic: {account.mnemonic}&nbsp;</div>
      <div>
        {
          !account.isTesting &&
            <Button onClick={onDelete}>Delete</Button>
        }
      </div>
    </AccountWrap>
  );
};

export const Accounts: FC = (): ReactElement => {
  const [ accounts, setAccounts ] = useState<AccountInfo[]>([]);
  const [ isCreateModalOpen, setCreateModalOpen ] = useState<boolean>(false);
  const [ isImportModalOpen, setImportModalOpen ] = useState<boolean>(false);
  const { api } = useContext(ApiContext);

  useEffect(() => {
    
    const sub = accountsObservable.subject.pipe(
      map(accounts => transformAccounts(accounts)),
      mergeMap(accounts =>
        zip(
          ...accounts.map(keyringAccount =>
            api.query.balances.account(keyring.decodeAddress(keyringAccount.address)).pipe(
              map(accountInfo => ({
                ...keyringAccount,
                balance: accountInfo.free.toString(),
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
      console.log('accounts', accounts);
    }, e => console.log('eee', e));

    return () => sub.unsubscribe();
  }, [api.query.balances]);

  return (
    <Wrapper>
      <ButtonGroup>
        <Button onClick={() => setCreateModalOpen(true)}>Add Account</Button>
        <Button onClick={() => setImportModalOpen(true)}>Import Account</Button>
      </ButtonGroup>
      <AccountsArea>
        <AccountList>
          <AccountListTitle>Default Accounts</AccountListTitle>
          {
            accounts.filter(account => !!account.isTesting).map(account =>
              <Account account={account} key={account.address} />
            )
          }
          <AccountWrap></AccountWrap>
        </AccountList>
        <AccountList>
          <AccountListTitle>New Accounts</AccountListTitle>
          {
            accounts.filter(account => !account.isTesting).map(account =>
              <Account account={account} key={account.address} />
            )
          }
        </AccountList>
      </AccountsArea>
      {
        isCreateModalOpen &&
          <CreateAccount open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}/>
      }
      <Modal visible={isImportModalOpen}>
          
      </Modal>
    </Wrapper>
  );
};
