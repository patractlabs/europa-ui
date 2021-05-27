import React, { FC, ReactElement, useState, useEffect, useCallback, useContext } from 'react';
import styled from 'styled-components';
import MoreSvg from '../../assets/imgs/more.svg';
import { AbiMessage } from '@polkadot/api-contract/types';
import { AddressInput, Style } from '../../shared';
import { Button, message as messageService } from 'antd';
import { Param } from '../../params/Param';
import { ContractRx } from '@polkadot/api-contract';
import { ApiContext, handleTxResults, useAccounts } from '../../core';
import { hexToNumber } from '@polkadot/util';
import BN from 'bn.js';
import keyring from '@polkadot/ui-keyring';

const Wrapper = styled.div`
  background-color: ${Style.color.bg.default};
  margin-bottom: 16px;

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
const Params = styled.div`
  width: 50%;
  min-width: 550px;

  .data-input {
    margin-bottom: 16px;
  }
  .data-input:last-child {
    margin-bottom: 20px;
  }
`;

const Caller = styled.div`

  > .caller {
    font-size: 16px;
    font-weight: bold;
    color: #2A292B;
    padding-bottom: 8px;
  }
`;

const Result = styled.div`
  padding-top: 18px;

  > .type {
    font-size: 16px;
    font-weight: bold;
    color: #2A292B;
  }
`;


export const Message: FC<{ contract: ContractRx, message: AbiMessage; index: number }> = ({ contract, message, index }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const [ sender, setSender ] = useState<string>('');
  const [ result, setResult ] = useState<any>();
  const [ params, setParams ] = useState<{ [key: string]: string}>({});
  const { accounts } = useAccounts();
  const { tokenDecimal } = useContext(ApiContext);

  const queryEstimatedWeight = useCallback(
    async (fields: any[], value?: string) => {
      const { gasConsumed, result } = await contract.query[message.method](sender, { gasLimit: -1, value: value || '0' }, ...fields).toPromise();
      return result.isOk ? gasConsumed : null;
    },
    [contract, message, sender],
  );

  const send = useCallback(async () => {
    console.log('send', params, sender);
    const fields = Object.keys(params).map(key => params[key]);
    if (!message.isMutating) {
      const query = await contract.query[message.method](accounts[0].address, {}, ...fields).toPromise();
      // const a = new BN(query.output?.toString() ||'');
      // console.log(a.div(new BN(10).pow(new BN(tokenDecimal))).toString());
      setResult(query.output?.toHuman());
      return;
    }

    // const estimatedGas = await queryEstimatedWeight(fields);
    const tx = contract.tx[message.method]({
      gasLimit: 200000000000,
      value: 0,
    }, ...fields);
    const account = accounts.find(account => account.address === sender);
    const suri = account?.mnemonic || `//${account?.name}`;
    const pair = keyring.createFromUri(suri);

    tx.signAndSend(pair).subscribe(
      handleTxResults({
        success() {
          messageService.success('executed');
        },
        fail(e) {
          console.log(e.events.map(e => e.toHuman()));
          messageService.error('failed');
        },
        update(r) {
          messageService.info(r.events.map(e => e.toHuman()));
        }
      }, () => {})
    );
  }, [params, sender, contract, message, accounts]);

  useEffect(() => {
    const params = message.args.reduce((p: { [key: string]: string}, arg) => {
      p[arg.name] = '';
      return p;
    }, {});
    setParams(params);
  }
  , [message]);

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
            <Params>
              {
                message.args.map(arg =>
                  <div key={arg.name} className="data-input">
                    <Param arg={arg} onChange={value => setParams({
                      ...params,
                      [arg.name]: value as string
                    })} />
                  </div>
                )
              }
              
              {
                message.isMutating &&
                  <Caller className="data-input">
                    <div className="caller">Caller</div>
                    <AddressInput onChange={setSender}/>
                  </Caller>
              }
            </Params>
            <Exec>
              <Button onClick={send}>{ message.isMutating ? 'Execute' : 'Read' }</Button>
            </Exec>
            <Result>
              <span className="type">{ message.returnType?.displayName }: </span>
              <span className="value">{ result }</span>
            </Result>
          </Call>
      }
    </Wrapper>
  );
};
