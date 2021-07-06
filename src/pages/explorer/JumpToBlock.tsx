import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import styled from 'styled-components';
import { ModalMain, Style } from '../../shared';
import { ApiContext, BlocksContext } from '../../core';

const Content = styled(ModalMain)`
  .content {
    text-align: center;
    .hint {
      margin-top: 16px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: ${Style.color.label.default};
    }
    .ant-input {
      width: 320px;
      border: 1px solid ${Style.color.button.primary};
      outline: none;
      height: 56px;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: ${Style.color.link.default};
      letter-spacing: 20px;
    }
    .ant-input:focus {
      outline: 0;
      box-shadow: none;
    }
  }
  .footer {
    .ant-btn {
      width: 320px;
    }
    .warning-btn {
      background-color: ${Style.color.label.primary};
    }
    .warning-btn:hover {
      color: white;
    }
  }
`;

const JumpToBlock: FC<{ direction: 'backward' | 'forward'; onClose: () => void }> = ({ direction, onClose }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { backward } = useContext(BlocksContext);
  const [ height, setHeight ] = useState<string>();

  const onClick = useCallback(() => {
    const targetBlockHeight = parseInt(height || '');
    if (`${targetBlockHeight}` !== height) {
      return;
    }

    if (direction === 'backward') {
      backward(targetBlockHeight);
    } else {
      (api as any).rpc.europa.forwardToHeight(targetBlockHeight).subscribe(
        () => console.log('forward to:', targetBlockHeight),
        () => console.log('bad forward'),
      );
    }
    onClose();
  }, [direction, onClose, backward, height, api]);

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
          <h2>{ direction === 'forward' ? 'Go To Block' : 'Back To Block'}</h2>
        </div>
        <div className="content">
          <p className="hint">
            {
              direction === 'forward' ?
                'The rpc provide a way to produce a batch of empty block to reach target block height' :
                'The rpc could revert current best height to the specified height which is less than current best height.'
            }
          </p>
          <Input value={height} onChange={e => setHeight(e.target.value)} />
        </div>
        <div className="footer">
          {
            direction === 'forward' ?
             <Button type="primary" onClick={onClick}>Confirm</Button> :
             <Button type="primary" className="warning-btn" onClick={onClick}>Confirm</Button>
          }
        </div>
      </Content>
    </Modal>
  );
};

export default JumpToBlock;