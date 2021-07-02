import React, { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { AccountsContext, ApiContext, handleTxResults } from '../../core';
import { Constructor } from './Constructor';
import { AddressInput, ParamInput, Style } from '../../shared';
import { message as antMessage } from 'antd';
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

const ButtonPrimary = styled.button`
  cursor: pointer;
  padding: 0px 38px;
  height: 40px;
  background: ${Style.color.button.primary};
  color: white;
  border-radius: 26px;
  border-width: 0px;
`;

export const Deploy: FC<{ abi?: Abi; name?: string; codeHash: string }> = ({ abi, name, codeHash }): ReactElement => {
  const { api, tokenDecimal } = useContext(ApiContext);
  const { accounts } = useContext(AccountsContext);
  const [ args, setArgs ] = useState<any[]>([]);
  const [ { address, endowment, gasLimit, salt }, setState ] = useState<{
    address: string;
    endowment: number;
    gasLimit: number;
    salt: string;
  }>({
    address: accounts[0]?.address || '',
    endowment: 10,
    gasLimit: 200000,
    // (api.consts.system.blockWeights
    //   ? api.consts.system.blockWeights.maxBlock
    //   : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN),
    salt: randomAsHex(),
  });
  const [ message, setMessage ] = useState<AbiMessage | undefined>(abi?.constructors[0]);

  const deploy = useCallback(async () => {
    if (!abi || !isWasm(abi.project.source.wasm) || !message) {
      return;
    }
    
    const code = new CodeRx(api, abi, abi?.project.source.wasm);
    const value = (new BN(endowment)).mul((new BN(10)).pow(new BN(tokenDecimal)));
    
    console.log({
      salt,
      endowment: value.toString(),
      args: args.map(arg => `${arg}`),
      sender: address, 
      gasLimit: (new BN(gasLimit)).mul(new BN(1000000)).toString(), 
    });
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(new BN(1000000)),
      value,
      salt,
    }, ...args);
    const account = accounts.find(account => account.address === address);
    if (!account) {
      return
    }
    const pair = account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);

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
  }, [abi, api, args, endowment, address, accounts, gasLimit, message, salt, tokenDecimal]);

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
                onParamsChange={setArgs}
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
                  onChange={address => setState(pre => ({...pre, address}))} 
                />
              </LabeledInput>
            </div>
            <div>
              <ButtonPrimary onClick={deploy}>Deploy</ButtonPrimary>
            </div>
          </div>
      }
    </Wrapper>
  );
};
