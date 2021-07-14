import React, { FC, ReactElement, useContext } from 'react';
import { Button, Modal } from 'antd';
import styled from 'styled-components';
import { ModalMain, Style } from '../../shared';
import { BlocksContext } from '../../core';
import { Link } from 'react-router-dom';

const Content = styled(ModalMain)`
  > .content {
    text-align: center;
    > .hint {
      margin-top: 16px;
    }
  }
  > .footer {
    .ant-btn {
      height: 52px;
      width: 200px;
    }
    > .confirm:hover {
      background-color: ${Style.color.button.primary};
      color: white;
      opacity: 0.85;
    }
    > .cancel:hover {
      border: 1px solid ${Style.color.button.primary};
      background-color: white;
      color: ${Style.color.button.primary};
      opacity: 0.85;
    }

    > .cancel {
      margin-left: 16px;
    }
  }
`;

const ConfirmBack: FC<{ height: number; onClose: () => void }> = ({ height, onClose }): ReactElement => {
  const { backward } = useContext(BlocksContext);

  return (
    <Modal
      width={560}
      title={null}
      onCancel={onClose}
      visible={true}
      footer={null}
    >
      <Content>
        <div className="header">
          <h2>Back to <Link to={`/block/${height}`}>#{height}</Link></h2>
        </div>
        <div className="content">
          <p className="hint">
            Are you sure to back to block #{height}
          </p>
        </div>
        <div className="footer">
          <Button type="primary" className="confirm" onClick={() => {
            backward(height);
            onClose();
          }}>Confirm</Button>
          <Button type="default" className="cancel" onClick={onClose}>Cancel</Button>
        </div>
      </Content>
    </Modal>
  );
};

export default ConfirmBack;