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
import keyring from '@polkadot/ui-keyring';
import { AbiMessage } from '@polkadot/api-contract/types';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import LabeledInput from '../developer/shared/LabeledInput';
import MoreSvg from '../../assets/imgs/more.svg';
import RawData from './RawData';
import LabeledValue from '../developer/shared/LabeledValue';
import { BN_MILLION, BN_TEN } from '@polkadot/util';
import type { Weight } from '@polkadot/types/interfaces';
import { RawParams } from '../../react-params/types';

const Wrapper = styled.div<{ hasAbi: boolean }>`
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 20px;
  flex: 1;
  height: ${props => !props.hasAbi ? 0 : '' };

  .deploy {
    padding: 40px 0px;
  }
  .form {
    width: 480px;
    margin: 16px 0px 30px 0px;
  }
`;

export const Deploy: FC<{ abi?: Abi; name?: string; codeHash: string }> = ({ abi, name, codeHash }): ReactElement => {
  const { api, tokenDecimal } = useContext(ApiContext);
  const { accounts } = useContext(AccountsContext);
  const [ params, setParams ] = useState<RawParams>([]);
  const [ message, setMessage ] = useState<AbiMessage | undefined>(abi?.constructors[0]);
  const [ { sender, endowment, gasLimit, salt }, setState ] = useState<{
    sender: string;
    endowment: number;
    gasLimit: number;
    salt: string;
  }>({
    sender: accounts[0]?.address || '',
    endowment: 10,
    gasLimit: (api.consts.system.blockWeights
      ? api.consts.system.blockWeights.maxBlock
      : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN).toNumber(),
    salt: randomAsHex(),
  });

  const isDisabled = useMemo(() => {
    return !abi || !isWasm(abi.project.source.wasm) || !message || !endowment || !gasLimit || !sender || !params.every(param => param.isValid);
  }, [abi, message, endowment, gasLimit, sender,params]);

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
    const value = (new BN(endowment)).mul((BN_TEN).pow(new BN(tokenDecimal)));
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(BN_MILLION),
      value,
      salt,
    }, ...params.map(param => param.value as any));

    await tx.signAndSend(pair).pipe(
      catchError(e => {
        antMessage.error(e.message || 'failed')
        return throwError('');
      })
    ).subscribe(
      handleTxResults({
        success() {
          antMessage.success('deployed');
        },
        fail(e) {
          console.log(e.events.map(e => e.toHuman()));
          
          antMessage.error('failed');
        },
        update(r) {
          antMessage.info(r.events.map(e => e.toHuman()));
        }
      }, () => {})
    );
  }, [abi, api, params, endowment, sender, accounts, gasLimit, message, salt, tokenDecimal]);

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
              <ParamInput
                defaultValue={endowment}
                style={{ margin: '20px 0px' }}
                onChange={
                  value => setState(pre => ({...pre, endowment: parseInt(value)}))
                }
                label="Endowment" unit="DOT"
              />
              <ParamInput
                defaultValue={salt}
                style={{ borderBottomWidth: '0px' }}
                onChange={
                  value => setState(pre => ({...pre, salt: value}))
                }
                label="unique deployment salt"
              />
              <ParamInput
                defaultValue={gasLimit}
                style={{ borderBottomWidth: '0px' }}
                onChange={
                  value => setState(pre => ({...pre, gasLimit: parseInt(value)}))
                }
                label="max gas allowed"
              />

              <LabeledInput>
                <div className="span">Caller</div>
                <AddressInput
                  defaultValue={accounts[0]?.address}
                  bordered={false}
                  suffixIcon={<img src={MoreSvg} alt="" />}
                  onChange={address => setState(pre => ({...pre, sender: address}))} 
                />
              </LabeledInput>
            </div>
            <div>
              <Button disabled={isDisabled} type="primary" onClick={deploy}>Deploy</Button>
            </div>
          </div>
      }
    </Wrapper>
  );
};
