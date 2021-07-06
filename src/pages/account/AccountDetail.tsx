import React, { FC, ReactElement } from 'react';
import { Button, Modal } from 'antd';
import { AccountInfo } from '../../core';
import styled from 'styled-components';
import { Style, ModalMain } from '../../shared';

const Content = styled(ModalMain)`
  .content {
    text-align: center;
    .address {
      margin-top: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      color: ${Style.color.label.default};
    }
    .seed {
      margin-bottom: 16px;
    }
  }
`;
const DefaultButton = styled(Button)`
  width: 320px;
  margin-right: 16px;
`;

const AccountDetail: FC<{ account: AccountInfo, onClose: () => void }> = ({ account, onClose }): ReactElement => {
  return (
    <Modal
      width={610}
      title={null}
      onCancel={onClose}
      visible={true}
      footer={null}
    >
      <Content>
        <div className="header">
          <h2>Mnemonic</h2>
        </div>
        <div className="content">
          <p className="address">{account.address}</p>
          <p className="seed">{account.mnemonic}</p>
        </div>
        <div className="footer">
          <DefaultButton onClick={onClose}>Confirm</DefaultButton>
        </div>
      </Content>
    </Modal>
  );
};

export default AccountDetail;