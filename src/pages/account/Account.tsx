import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { AccountInfo } from '../../core';
import { Style } from '../../shared';
import MnemonicSvg from '../../assets/imgs/mnemonic.svg';
import DeleteSvg from '../../assets/imgs/delete.svg';
import SendSvg from '../../assets/imgs/send.svg';
import { Link } from 'react-router-dom';
import DeleteAccount from './Delete';
import AccountDetail from './AccountDetail';
import Transfer from './Transfer';

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

const Account: FC<{
  account: AccountInfo;
  className?: string;
  onUpdateList: () => void;
}> = ({ account, className, onUpdateList }): ReactElement => {
  const [ isDeleteModalOpen, setDeleteModalOpen ] = useState<boolean>(false);
  const [ isDetailModalOpen, setDetailModalOpen ] = useState<boolean>(false);
  const [ isTransferModalOpen, setTransferModalOpen ] = useState<boolean>(false);
  
  return (
    <div className={className}>
      <div className="name">{account.name}</div>
      <div className="address">
        <Link to={`/explorer/eoa/${account.address}`}>
          {account.address}
        </Link>
      </div>
      <div className="balance">{account.balance}</div>
          <div className="operation">
            <div className="transfer"  onClick={() => setTransferModalOpen(true)}>
              <img src={SendSvg} alt="" />
              <span>Transfer</span>
            </div>
            {
              !account.isTesting &&
                <div className="mnemonic"  onClick={() => setDetailModalOpen(true)}>
                  <img src={MnemonicSvg} alt="" />
                  <span>Mnemonic</span>
                </div>
            }
            {
              !account.isTesting &&
                <Button style={{ marginLeft: '20px' }} onClick={() => setDeleteModalOpen(true)}>
                  <img src={DeleteSvg} alt="" />
                  <span style={{ color: Style.color.icon.fail }}>
                    Delete
                  </span>
                </Button>
            }
          </div>
      {
        isDeleteModalOpen &&
          <DeleteAccount account={account} onClose={() => setDeleteModalOpen(false)} />
      }
      {
        isDetailModalOpen &&
          <AccountDetail account={account} onClose={() => setDetailModalOpen(false)} />
      }
      {
        isTransferModalOpen &&
          <Transfer account={account} onClose={() => {
            setTransferModalOpen(false);
            onUpdateList();
          }} />
      }
    </div>
  );
};

export default React.memo(styled(Account)`
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
    text-overflow: ellipsis;
    overflow: hidden;
    width: 10%;
    font-weight: 600;
  }
  > .address {
    text-overflow: ellipsis;
    overflow: hidden;
    width: 50%;
    padding: 0px 10px;
  }
  > .balance {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 15%;
    font-weight: 600;
  }
  > .operation {
    justify-content: flex-end;
    display: flex;
    align-items: center;
    width: 25%;
    overflow: hidden;

    .mnemonic, .transfer {
      display: flex;
      align-items: center;
      margin-left: 20px;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;

      > img {
        width: 15px;
        height: 15px;
      }
      > span {
        font-weight: 600;
        color: ${Style.color.primary};
        margin-left: 8px;
        font-weight: 600;
        overflow: hidden;
      }
    }
    .transfer {
      margin-left: 0px;
    }
  } 
`);
