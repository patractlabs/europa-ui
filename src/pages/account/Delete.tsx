import React, { FC, ReactElement } from 'react';
import { Modal } from 'antd';
import keyring from '@polkadot/ui-keyring';
import { AccountInfo } from '../../core';
import styled from 'styled-components';
import { Style } from '../../shared';
import { Button, ModalMain } from '../../shared';

const Content = styled(ModalMain)`
    text-align: center;
  .content p {
    margin-top: 16px;
    font-size: 14px;
    line-height: 30px;
  }
`;
const DefaultButton = styled(Button)`
  width: 200px;
  background-color: ${Style.color.button.primary};
  margin-right: 16px;
`;
const DeleteButton = styled(Button)`
  width: 200px;
  background-color: ${Style.color.icon.fail};
`;

const DeleteAccount: FC<{ account: AccountInfo, onClose: () => void }> = ({ account, onClose }): ReactElement => {
  const onDelete = () => {
    keyring.forgetAccount(account.address);
    onClose();
  }

  return (
    <Modal
      width={610}
      title={null}
      onCancel={onClose}
      visible={true}
      footer={null}>
        <Content>
          <div className="header">
            <h2>Are you sure to delete this account?</h2>
          </div>
          <div className="content">
            <p>
              {account.address}
            </p>
          </div>
          <div className="footer">
            <DefaultButton onClick={onClose}>Cancel</DefaultButton>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
          </div>
        </Content>
    </Modal>
  );
};

export default DeleteAccount;