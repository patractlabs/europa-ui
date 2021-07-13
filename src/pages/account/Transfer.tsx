import React, { useState, useMemo, FC, ReactElement, useCallback, useContext } from 'react';
import { Button, Modal } from 'antd';
import { AccountInfo, ApiContext, handleTxResults, usePair } from '../../core';
import styled from 'styled-components';
import { TxError, Style, ModalMain, AddressInput, notification } from '../../shared';
import LabeledInput from '../developer/shared/LabeledInput';
import { InputBalance } from '../../react-components';
import MoreSvg from '../../assets/imgs/more.svg';
import type BN from 'bn.js';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const Content = styled(ModalMain)`
  .content {
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

const Transfer: FC<{ account: AccountInfo, onClose: () => void }> = ({ account, onClose }): ReactElement => {
  const [ amount, setAmount ] = useState<BN>();
  const [ tip, setTip ] = useState<BN>();
  const [ to, setTo ] = useState<string>();
  const { api, metadata } = useContext(ApiContext);
  const pair = usePair(account.address);

  const isDisabled = useMemo(() => !to || !amount || amount.toNumber() === 0, [amount, to]);

  const exec = useCallback(() => {

    if (!pair || !to || !amount) {
      return;
    }

    api.tx.balances.transfer(to, amount).signAndSend(pair, { tip }).pipe(
      catchError(e => {
        notification.fail({
          message: 'Failed',
          description: e.message,
        });
        return throwError('');
      })
    ).subscribe(
      handleTxResults({
        success() {
          notification.success({
            message: 'Success',
            description: 'Transfered',
          });
          onClose();
        },
        fail(status) {
          notification.fail({
            message: 'Failed',
            description: <TxError metadata={metadata} error={status.dispatchError} />,
          });
        },
        update(r) {
        }
      }, () => {})
    );

  }, [api, amount, pair, tip, to, onClose, metadata]);
  
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
          <h2>Transfer</h2>
        </div>
        <div className="content">
        
        <LabeledInput style={{ marginTop: '16px' }}>
          <div className="span">To Address</div>
          <AddressInput
            defaultValue={to}
            bordered={false}
            suffixIcon={<img src={MoreSvg} alt="" />}
            onChange={setTo}
          />
        </LabeledInput>

        <LabeledInput style={{  marginTop: '16px' }}>
          <div className="span">Amount</div>
          <InputBalance
            siWidth={15}
            label="Tip"
            onChange={setAmount}
            value={amount}
          />
        </LabeledInput>

        <LabeledInput style={{  marginTop: '16px' }}>
          <div className="span">Tip</div>
          <InputBalance
            siWidth={15}
            label="Tip"
            onChange={setTip}
            value={tip}
          />
        </LabeledInput>

        </div>
        <div className="footer">
          <DefaultButton disabled={isDisabled} onClick={exec}>Confirm</DefaultButton>
        </div>
      </Content>
    </Modal>
  );
};

export default Transfer;