import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { CreateAccount } from './CreateAccount';
import { AccountsContext } from '../../core';
import { ImportAccount } from './ImportAccount';
import { Style } from '../../shared';
import AddSvg from '../../assets/imgs/add-account.svg';
import ImportSvg from '../../assets/imgs/import-account.svg';
import Account from './Account';

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

const Accounts: FC<{ className?: string }> = ({ className }): ReactElement => {
  const [ isCreateModalOpen, setCreateModalOpen ] = useState<boolean>(false);
  const [ isImportModalOpen, setImportModalOpen ] = useState<boolean>(false);
  const { accounts, update } = useContext(AccountsContext);

  useEffect(() => update(), [update]);

  return (
    <div className={className}>
      <div className="accounts-area">
        <div className="title">
          <span>New Accounts</span>
          <div className="button-group">
            <Button onClick={() => setCreateModalOpen(true)}>
              <img src={AddSvg} alt="" />
              Add Account
            </Button>
            <Button onClick={() => setImportModalOpen(true)}>
              <img src={ImportSvg} alt="" />
              Import Account
            </Button>
          </div>
        </div>
        
        {
          !!accounts.filter(account => !account.isTesting).length && 
            <div className="list-header">
              <span className="name">Name</span>
              <span className="address">Address</span>
              <span className="balance">Balance</span>
            </div>
        }
        
        {
          accounts.filter(account => !account.isTesting).map(account =>
            <Account account={account} key={account.address} />
          )
        }
      </div>
      <div className="accounts-area">
        <div className="title">
          Default Accounts
        </div>
        
        {
          !!accounts.filter(account => !!account.isTesting) &&
            <div className="list-header">
              <span className="name">Name</span>
              <span className="address">Address</span>
              <span className="balance">Balance</span>
            </div>
        }

        {
          accounts.filter(account => !!account.isTesting).map(account =>
            <Account account={account} key={account.address} />
          )
        }
      </div>
      {
        isCreateModalOpen &&
          <CreateAccount open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}/>
      }
      {
        isImportModalOpen &&
          <ImportAccount open={isImportModalOpen} onClose={() => setImportModalOpen(false)}/>
      }
    </div>
  );
};

export default React.memo(styled(Accounts)`
  padding: 20px;

  .accounts-area {
    margin-bottom: 20px;

    &:hover {
      /* background-color: ; */
    }
    &:last-child {
      margin-bottom: 0px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: ${Style.color.label.primary};
      line-height: 24px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
    }
    .list-header {
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
    }
  }
  .button-group {
    display: flex;
    margin-left: 30px;
  }
`);
