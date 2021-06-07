import React, { FC, ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { CreateAccount } from './CreateAccount';
import keyring from '@polkadot/ui-keyring';
import { AccountInfo, AccountsContext } from '../../core';
import { ImportAccount } from './ImportAccount';
import { Style } from '../../shared';
import AddSvg from '../../assets/imgs/add-account.svg';
import MnemonicSvg from '../../assets/imgs/mnemonic.svg';
import DeleteSvg from '../../assets/imgs/delete.svg';
import ImportSvg from '../../assets/imgs/import-account.svg';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-left: 30px;
`;

const Button = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: ${Style.color.label.primary};
  margin-right: 20px;

  &:last-child {
    margin-right: 0px;
  }
  > img {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }
`;

const AccountsArea = styled.div`
  margin-bottom: 20px;

  &:hover {
    /* background-color: ; */
  }
  &:last-child {
    margin-bottom: 0px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${Style.color.label.primary};
  line-height: 24px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
`;
const ListHeader = styled.div`
  display: flex;
  color: ${Style.color.label.default};
  padding: 7px 20px 10px 20px;

  > .name {
    width: 10%;
  }
  
  > .address {
    width: 50%;

  }

  > .balance {
    width: 15%;

  }
`;

const AccountWrapper = styled.div`
  display: flex;
  background-color: white;
  height: 48px;
  line-height: 48px;
  margin-bottom: 10px;
  color: ${Style.color.label.primary};
  padding: 0px 20px;

  &:hover {
    background-color: ${Style.color.bg.default};
  }
  &:last-child {
    margin-bottom: 0px;
  }

  > .name {
    width: 10%;
    font-weight: 600;
  }
  > .address {
    width: 50%;
  }
  > .balance {
    width: 15%;
    font-weight: 600;
  }
  > .operation {
    justify-content: flex-end;
    display: flex;
    align-items: center;
    width: 25%;

    .mnemonic {
      display: flex;
      align-items: center;
      margin-right: 20px;
      cursor: pointer;

      > img {
        width: 15px;
        height: 15px;
      }
      > span {
        margin-left: 8px;
        font-weight: 600;
        color: ${Style.color.primary};
      }
    }
  }
`;

const Account: FC<{
  account: AccountInfo;
}> = ({ account }): ReactElement => {

  const onDelete = () => {
    keyring.forgetAccount(account.address);
  }

  return (
    <AccountWrapper>
      <div className="name">{account.name}</div>
      <div className="address">
        <Link to={`/explorer/eoa/${account.address}`}>
          {account.address}
        </Link>
      </div>
      <div className="balance">{account.balance}</div>
      {
        !account.isTesting &&
          <div className="operation">
            <Tooltip title={account.mnemonic}>
              <div className="mnemonic">
                <img src={MnemonicSvg} alt="" />
                <span>Show Mnemonic</span>
              </div>
            </Tooltip>
            <Button onClick={onDelete}>
              <img src={DeleteSvg} alt="" />
              <span style={{ color: Style.color.icon.fail }}>
                Delete
              </span>
            </Button>
          </div>
      }
    </AccountWrapper>
  );
};

export const Accounts: FC = (): ReactElement => {
  const [ isCreateModalOpen, setCreateModalOpen ] = useState<boolean>(false);
  const [ isImportModalOpen, setImportModalOpen ] = useState<boolean>(false);
  const { accounts } = useContext(AccountsContext);

  return (
    <Wrapper>
      <AccountsArea>
        <Title>
          <span>New Accounts</span>
          <ButtonGroup>
            <Button onClick={() => setCreateModalOpen(true)}>
              <img src={AddSvg} alt="" />
              Add Account
            </Button>
            <Button onClick={() => setImportModalOpen(true)}>
              <img src={ImportSvg} alt="" />
              Import Account
            </Button>
          </ButtonGroup>
        </Title>
        
        <ListHeader>
          <span className="name">Name</span>
          <span className="address">Address</span>
          <span className="balance">Balance</span>
        </ListHeader>
        
        {
          accounts.filter(account => !account.isTesting).map(account =>
            <Account account={account} key={account.address} />
          )
        }
      </AccountsArea>
      <AccountsArea>
        <Title>Default Accounts</Title>
        
        <ListHeader>
          <span className="name">Name</span>
          <span className="address">Address</span>
          <span className="balance">Balance</span>
        </ListHeader>

        {
          accounts.filter(account => !!account.isTesting).map(account =>
            <Account account={account} key={account.address} />
          )
        }
      </AccountsArea>
      {
        isCreateModalOpen &&
          <CreateAccount open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}/>
      }
      {
        isImportModalOpen &&
          <ImportAccount open={isImportModalOpen} onClose={() => setImportModalOpen(false)}/>
      }
    </Wrapper>
  );
};
