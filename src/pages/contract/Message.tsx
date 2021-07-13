import React, { FC, ReactElement, useState, useCallback, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MoreSvg from '../../assets/imgs/more.svg';
import { AbiMessage } from '@polkadot/api-contract/types';
import { TxError, AddressInput, notification, Style, ParamInput } from '../../shared';
import { Button } from 'antd';
import { ContractRx } from '@polkadot/api-contract';
import { AccountsContext, ApiContext, handleTxResults } from '../../core';
import { keyring } from '@polkadot/ui-keyring';
import Params from './Params';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { encodeTypeDef, getTypeDef } from '@polkadot/types/create';
import BN from 'bn.js';
import LabeledInput from '../developer/shared/LabeledInput';
import { InputBalance } from '../../react-components';
import { Trace } from '../extrinsic/Detail';
import { ApiRx } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces/runtime';
import { Codec, IExtrinsic, IMethod, TypeDef } from '@polkadot/types/types';
import { GenericCall } from '@polkadot/types';
import { ContractTrace } from '../extrinsic/Trace';
import { BN_MILLION } from '@polkadot/util';
import { RawParams } from '../../react-params/types';

const Wrapper = styled.div`
  margin-bottom: 16px;
  background-color: ${Style.color.bg.default};

  &:last-child {
    margin-bottom: 0px;
  }

  > .message-signature {
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
  }
  > .call {
    
    border-top: 1px solid #DEDEDE;
    padding: 16px 20px;

    .result {
      display: flex;
      justify-content: space-between;
      padding-top: 18px;
    }
  }
`;

const Toggle = styled.img`
  width: 16px;
  height: 16px;
`;

const Exec = styled.div`

  > button:first-child {
    margin-right: 8px;
  }
`;

const ParamsContainer = styled.div`
  width: 90%;
  max-width: 800px;
`;

const Result = styled.div`
  display: flex;
  align-items: center;
  > .type {
    margin-right: 8px;
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
  }
`;

interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}

export function extractState (value: IExtrinsic | IMethod) {
  const params = GenericCall.filterOrigin(value.meta).map(({ name, type }): Param => ({
    name: name.toString(),
    type: getTypeDef(type.toString())
  }));
  const values = value.args.map((value): Value => ({
    isValid: true,
    value
  }));


  return { params, values };
}

export function extractCallData(api: ApiRx, contractPromise: ContractRx, message: AbiMessage, params: any[], gasLimit: BN) {
  const tx = contractPromise.tx[message.method]({
    gasLimit,
    value: 0,
  }, ...params);
  
  const hex = tx.toHex();
  let extrinsicCall: Call;

  try {
    // cater for an extrinsic input...
    extrinsicCall = api.createType('Call', api.tx(hex).method);
  } catch (e) {
    extrinsicCall = api.createType('Call', hex);
  }

  const { params: paramsDef, values } = extractState(extrinsicCall);
  const dataIndex = paramsDef.findIndex(p => p.name === 'data');

  return values[dataIndex].value.toHex();
}

export const Message: FC<{ contract: ContractRx, message: AbiMessage; index: number }> = ({ contract, message, index }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const { api, wsProvider, metadata } = useContext(ApiContext);
  const [ result, setResult ] = useState<any>();
  const [ gasConsumed, setGasConsumed ] = useState<string>();
  const [ params, setParams ] = useState<RawParams>([]);
  const { accounts } = useContext(AccountsContext);
  const [ sender, setSender ] = useState<string>('');
  const [ tip, setTip ] = useState<BN>();
  const [ trace, setTrace ] = useState<Trace>();
  const [ gasLimit, setGasLimit ] = useState<number>(200000);
  const [ endowment, setEndowment ] = useState<BN>(new BN(0));

  const isDisabled = useMemo(() => !gasLimit || !sender || !params.every(param => param.isValid), [gasLimit, sender,params]);

  useEffect(() => setSender(accounts[0]?.address), [accounts]);

  useEffect(() => {
    try {
      console.log('params', params.map(p => p.value), sender);
      
      const sub = contract.query[message.method](sender, { gasLimit: -1, value: 0 }, ...params.map(p => p.value as any))
        .subscribe(({ gasConsumed, result }) => {
          console.log('gasC', gasConsumed.toString(), result.toHuman(), (new BN(gasConsumed.toString())).div(BN_MILLION).toNumber())
          if (result.isOk) {
            setGasLimit((new BN(gasConsumed.toString())).div(BN_MILLION).toNumber() + 1);
          }
        });
  
      return () => sub.unsubscribe();
    } catch (e) {}
  }, [params, contract, sender, message]);

  const CallWithTrace = useCallback(async () => {
    const data = extractCallData(api, contract, message, params.map(p => p.value), (new BN(gasLimit)).mul(BN_MILLION))

    console.log('data', data)
    wsProvider.send('contractsExt_call', [{
      origin: sender,
      dest: contract.address,
      value: endowment?.toNumber(),
      gasLimit: new BN(gasLimit).mul(BN_MILLION).toNumber(),
      inputData: data,
    }]).then(({ trace }: { trace: Trace}) => {
      setTrace(trace.depth ? trace : undefined);
    }, (e: any) => {
      console.log('e', e);
      setTrace(undefined);
    });
  }, [wsProvider, sender, api, contract, message, params, gasLimit, endowment]);

  const send = useCallback(async () => {
    if (!message.isMutating) {
      const query = await contract.query[message.method](sender, {}, ...params.map(p => p.value as any)).toPromise();

      setResult(JSON.stringify(query.output?.toHuman()) || '<empty>');
      setGasConsumed(query.gasConsumed.toString());

      return;
    }

    const tx = contract.tx[message.method]({
      gasLimit: new BN(gasLimit).mul(BN_MILLION),
      value: endowment,
    }, ...params.map(p => p.value as any));
    const account = accounts.find(account => account.address === sender);
    if (!account) {
      return
    }
    const pair = account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);

    tx.signAndSend(pair, { tip }).pipe(
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
            message: 'Executed',
            description: 'The extrinsic executed',
          });
        },
        fail(status) {
          notification.fail({
            message: 'Failed',
            description: <TxError metadata={metadata} error={status.dispatchError} />,
          });
        },
        update(r) {
        },
      }, () => {})
    );
  }, [params, sender, contract, message, accounts, gasLimit, tip, metadata, endowment]);

  return (
    <Wrapper>
      <div className="message-signature" onClick={() => setExpanded(!expanded)}>
        <div>
          <span className="message-id">{index}</span>
          <span className="signature">{message.method}</span>
        </div>
        <Toggle src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
      </div>
      {
        expanded &&
          <div className="call">
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
                  <ParamInput
                    style={{ marginTop: '20px', borderBottom: '0px' }}
                    value={`${gasLimit}`}
                    onChange={value => setGasLimit(`${parseInt(value)}` === 'NaN' ? 0 : parseInt(value))}
                    label="max gas allowed"
                  />
              }
              {
                message.isMutating &&
                  <LabeledInput style={{  }}>
                    <div className="span">endowment</div>
                    <InputBalance
                      siWidth={15}
                      label="endowment"
                      onChange={setEndowment}
                      value={endowment}
                    />
                  </LabeledInput>
              }
              {
                message.isMutating &&
                  <LabeledInput style={{ marginTop: '20px' }}>
                    <div className="span">Caller</div>
                    <AddressInput
                      defaultValue={accounts[0]?.address}
                      bordered={false}
                      suffixIcon={<img src={MoreSvg} alt="" />}
                      onChange={setSender} 
                    />
                  </LabeledInput>
              }
              
              {
                message.isMutating &&
                  <LabeledInput style={{ background: 'white', margin: '20px 0px' }}>
                    <div className="span">Tip</div>
                    <InputBalance
                      siWidth={15}
                      label="Tip"
                      onChange={setTip}
                      value={tip}
                    />
                  </LabeledInput>
              }
            </ParamsContainer>
            <Exec style={{ marginTop: message.isMutating ? '0px' : '20px' }}>
              <Button disabled={isDisabled} type="primary" onClick={send}>{ message.isMutating ? 'Execute' : 'Read' }</Button>
              <Button disabled={isDisabled} type="primary" onClick={CallWithTrace}>Call With Trace</Button>
            </Exec>
            {
              !message.isMutating && result &&
                <div className="result">
                  <Result>
                    <span className="type">{ message.returnType && encodeTypeDef(message.returnType) }: </span>
                    <pre className="value">{ result }</pre>
                  </Result>
                  <Result>
                    <span className="type">Gas Comsumed: </span>
                    <span className="value">{ gasConsumed }</span>
                  </Result>
                </div>
            }
            
            {
              trace &&
                <div style={{ marginTop: '20px' }}>
                  <ContractTrace index={0} trace={trace} />
                </div>
            }
          </div>
      }
    </Wrapper>
  );
};
