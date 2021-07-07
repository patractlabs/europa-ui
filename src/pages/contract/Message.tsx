import React, { FC, ReactElement, useState, useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';
import MoreSvg from '../../assets/imgs/more.svg';
import { AbiMessage } from '@polkadot/api-contract/types';
import { AddressInput, Style } from '../../shared';
import { Button, message as antMessage } from 'antd';
import { ContractRx } from '@polkadot/api-contract';
import { AccountsContext, ApiContext, handleTxResults } from '../../core';
import { keyring } from '@polkadot/ui-keyring';
import Params from './Params';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { encodeTypeDef } from '@polkadot/types/create';
import { getEstimatedGas } from './DeployModal';

const Wrapper = styled.div`
  margin-bottom: 16px;
  background-color: ${Style.color.bg.default};

  &:last-child {
    margin-bottom: 0px;
  }
`;

const MessageSignature = styled.div`
  padding: 0px 20px;
  cursor: pointer;
  height: 52px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .message-id {
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
    width: 70px;
  }
  
  .signature {
    font-size: 16px;
    color: ${Style.color.label.primary};
  }
`;
const Toggle = styled.img`
  width: 16px;
  height: 16px;
`;
const Exec = styled.div`
`;

const Call = styled.div`
  border-top: 1px solid #DEDEDE;
  padding: 16px 20px;

`;
const ParamsContainer = styled.div`
  width: 90%;
  max-width: 800px;
`;

const Caller = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;

  > .caller {
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
    padding-bottom: 8px;
  }
`;

const Result = styled.div`
  padding-top: 18px;

  > .type {
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
  }
`;

export const Message: FC<{ contract: ContractRx, message: AbiMessage; index: number }> = ({ contract, message, index }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const { api } = useContext(ApiContext);
  const [ result, setResult ] = useState<any>();
  const [params, setParams] = useState<any[]>([]);
  const { accounts } = useContext(AccountsContext);
  const [ sender, setSender ] = useState<string>('');

  useEffect(() => setSender(accounts[0]?.address), [accounts]);

  const queryEstimatedWeight = useCallback(
    async (fields: any[], value?: string) => {
      const { gasConsumed, result } = await contract.query[message.method](sender, { gasLimit: -1, value: value || '0' }, ...fields).toPromise();
      return result.isOk ? gasConsumed : null;
    },
    [contract, message, sender],
  );

  const send = useCallback(async () => {
    if (!message.isMutating) {
      const query = await contract.query[message.method](accounts[0].address, {}, ...params).toPromise();

      setResult(JSON.stringify(query.output?.toHuman()) || '<empty>');

      return;
    }

    const estimatedGas = await queryEstimatedWeight(params);
    const tx = contract.tx[message.method]({
      gasLimit: estimatedGas || getEstimatedGas(api),
      value: 0,
    }, ...params);
    const account = accounts.find(account => account.address === sender);
    if (!account) {
      return
    }
    const pair = account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);

    tx.signAndSend(pair).pipe(
      catchError(e => {
        antMessage.error(e.message || 'failed');
        return throwError('');
      })
    ).subscribe(
      handleTxResults({
        success() {
          antMessage.success('executed');
        },
        fail(e) {
          antMessage.error('failed');
        },
        update(r) {
          antMessage.info(r.events.map(e => e.toHuman()));
        }
      }, () => {})
    );
  }, [params, sender, contract, message, accounts, queryEstimatedWeight, api]);

  return (
    <Wrapper>
      <MessageSignature onClick={() => setExpanded(!expanded)}>
        <div>
          <span className="message-id">{index}</span>
          <span className="signature">{message.method}</span>
        </div>
        <Toggle src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
      </MessageSignature>
      {
        expanded &&
          <Call>
            <ParamsContainer>
              {
                <Params
                  onChange={setParams}
                  params={message?.args}
                  registry={contract.abi.registry}
                />
              }
              
              {
                message.isMutating &&
                  <Caller>
                    <div className="caller">Caller</div>
                    <AddressInput defaultValue={accounts[0]?.address} onChange={setSender}/>
                  </Caller>
              }
            </ParamsContainer>
            <Exec style={{ marginTop: message.isMutating ? '0px' : '20px' }}>
              <Button type="primary" onClick={send}>{ message.isMutating ? 'Execute' : 'Read' }</Button>
            </Exec>
            {
              !message.isMutating && result &&
                <Result>
                  <span className="type">{ message.returnType && encodeTypeDef(message.returnType) }: </span>
                  <span className="value">{ result }</span>
                </Result>
            }
          </Call>
      }
    </Wrapper>
  );
};
