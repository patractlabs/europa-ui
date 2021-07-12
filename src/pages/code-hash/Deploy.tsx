import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AccountsContext, ApiContext, handleTxResults } from '../../core';
import { Constructor } from './Constructor';
import { AddressInput, ParamInput } from '../../shared';
import { Button, message as antMessage } from 'antd';
import { randomAsHex } from '@polkadot/util-crypto';
import { isWasm } from '@polkadot/util';
import { Abi, CodeRx } from '@polkadot/api-contract';
import BN from 'bn.js';
import { keyring } from '@polkadot/ui-keyring';
import { AbiMessage } from '@polkadot/api-contract/types';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import LabeledInput from '../developer/shared/LabeledInput';
import MoreSvg from '../../assets/imgs/more.svg';
import RawData from './RawData';
import LabeledValue from '../developer/shared/LabeledValue';
import { BN_MILLION, BN_TEN } from '@polkadot/util';
import { RawParams } from '../../react-params/types';
import { getEstimatedGas } from '../contract/DeployModal';
import { InputBalance } from '../../react-components';
import {extractState } from '../contract/Message';
import { Trace } from '../extrinsic/Detail';
import { Call } from '@polkadot/types/interfaces';
import { ContractTrace } from '../extrinsic/Trace';

const Wrapper = styled.div<{ hasAbi: boolean }>`
  background-color: white;
  padding: 20px;
  flex: 1;
  height: ${props => !props.hasAbi ? 0 : '' };

  > .deploy {
    margin: 0px auto;
    padding: 40px 0px;
    width: 480px;
    > .form {
      margin: 16px 0px 30px 0px;
    }
    > .button-group {
      > button:last-child {
        margin-left: 8px;
      }
    }
  }
`;

export const Deploy: FC<{ abi?: Abi; name?: string; codeHash: string }> = ({ abi, name, codeHash }): ReactElement => {
  const { api, wsProvider, tokenDecimal } = useContext(ApiContext);
  const { accounts } = useContext(AccountsContext);
  const [ params, setParams ] = useState<RawParams>([]);
  const [ message, setMessage ] = useState<AbiMessage | undefined>(abi?.constructors[0]);
  const [ endowment, setEndowment ] = useState<BN | undefined>();
  const [ tip, setTip ] = useState<BN>();
  const [ trace, setTrace ] = useState<Trace>();
  const [ { sender, gasLimit, salt }, setState ] = useState<{
    sender: string;
    gasLimit: number;
    salt: string;
  }>({
    sender: accounts[0]?.address || '',
    gasLimit: getEstimatedGas(api),
    salt: randomAsHex(),
  });

  const isDisabled = useMemo(() => {
    return !abi || !isWasm(abi.project.source.wasm) || !message || !endowment || endowment.toNumber() === 0 || !gasLimit || !sender || !params.every(param => param.isValid);
  }, [abi, message, endowment, gasLimit, sender,params]);

  const CallWithTrace = useCallback(async () => {
    if (!message || !endowment) {
      return;
    }

    const code = new CodeRx(api, abi, abi?.project.source.wasm);
    const gas = (new BN(gasLimit)).mul(BN_MILLION);
    const tx = code.tx[message.method]({
      gasLimit: gas,
      value: endowment,
      salt,
    }, ...params.map(param => param.value as any));
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
    const codeIndex = paramsDef.findIndex(p => p.name === 'code');
    const data = values[dataIndex].value.toHex();
    const rawCode = values[codeIndex].value.toHex();

    wsProvider.send('contractsExt_instantiate', [{
      origin: sender,
      endowment: endowment.toNumber(),
      gasLimit: gas.toNumber(),
      code: { upload: rawCode },
      data,
      salt,
    }]).then(({ trace }: { trace: Trace}) => {
      setTrace(trace.depth ? trace : undefined);
    }, (e: any) => {
      console.log('e', e);
      setTrace(undefined);
    });
  }, [wsProvider, sender, api, abi, endowment, salt, gasLimit, message, params]);

  const deploy = useCallback(async () => {
    if (!abi || !isWasm(abi.project.source.wasm) || !message) {
      return;
    }
    
    const account = accounts.find(account => account.address === sender);

    if (!account) {
      return
    }

    const pair = account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);
    const code = new CodeRx(api, abi, abi?.project.source.wasm);
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(BN_MILLION),
      value: endowment,
      salt,
    }, ...params.map(param => param.value as any));

    setState(old => ({ ...old, salt: randomAsHex() }));
    await tx.signAndSend(pair, { tip }).pipe(
      catchError(e => {
        antMessage.error(e.message || 'Failed')
        return throwError('');
      })
    ).subscribe(
      handleTxResults({
        success() {
          antMessage.success('deployed');
        },
        fail(e) {
          antMessage.error('failed');
        },
        update(r) {
          antMessage.info(r.events.map(e => e.toHuman()));
        }
      }, () => {})
    );
  }, [abi, api, params, endowment, sender, accounts, gasLimit, message, salt, tip]);

  useEffect(() => setMessage(abi?.constructors[0]), [abi]);

  return (
    <Wrapper hasAbi={!!abi}>
      {
        !abi ?
          <RawData codeHash={codeHash} /> :
          <div className="deploy">
            <LabeledValue>
              <div className="span">Contract name</div>
              <div>{name}</div>
            </LabeledValue>
            <div className="form">
              <Constructor
                defaultValue={abi.constructors[0]}
                abiMessages={abi.constructors}
                onMessageChange={setMessage}
                onParamsChange={setParams}
              />
                  
              <LabeledInput style={{ marginTop: '16px', borderBottom: '0px' }}>
                <div className="span">endowment</div>
                <InputBalance
                  siWidth={15}
                  defaultValue={(new BN(10)).mul((BN_TEN).pow(new BN(tokenDecimal)))}
                  label="endowment"
                  onChange={setEndowment}
                  value={endowment}
                />
              </LabeledInput>
              <ParamInput
                defaultValue={gasLimit}
                style={{ borderBottomWidth: '0px' }}
                onChange={
                  value => setState(pre => ({...pre, gasLimit: parseInt(value)}))
                }
                label="max gas allowed"
              />
              <ParamInput
                defaultValue={salt}
                value={salt}
                onChange={
                  value => setState(pre => ({...pre, salt: value}))
                }
                label="unique deployment salt"
              />
                  
              <LabeledInput style={{  marginTop: '16px' }}>
                <div className="span">Tip</div>
                <InputBalance
                  siWidth={15}
                  label="Tip"
                  onChange={setTip}
                  value={tip}
                />
              </LabeledInput>

              <LabeledInput style={{ marginTop: '16px' }}>
                <div className="span">Caller</div>
                <AddressInput
                  defaultValue={accounts[0]?.address}
                  bordered={false}
                  suffixIcon={<img src={MoreSvg} alt="" />}
                  onChange={address => setState(pre => ({...pre, sender: address}))} 
                />
              </LabeledInput>
            </div>
            <div className="button-group">
              <Button disabled={isDisabled} type="primary" onClick={deploy}>Deploy</Button>
              <Button type="primary" onClick={CallWithTrace}>Call With Trace</Button>
            </div>
          </div>
      }
      {
        trace &&
          <div style={{ marginTop: '20px' }}>
            <ContractTrace codeHash={codeHash} index={0} trace={trace} />
          </div>
      }
    </Wrapper>
  );
};
