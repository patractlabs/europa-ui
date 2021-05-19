import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';
import { CreateAccount } from './CreateAccount';
import keyring from '@polkadot/ui-keyring';
import { AccountInfo, useAccounts } from './core/hook/useAccounts';

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
  const [ isCreateModalOpen, setCreateModalOpen ] = useState<boolean>(false);
  const [ isImportModalOpen, setImportModalOpen ] = useState<boolean>(false);
  const { accounts } = useAccounts();

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
