import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AccountsContext, ApiContext, handleTxResults, store } from '../../core';
import { Constructor } from './Constructor';
import { AddressInput, ParamInput, Style } from '../../shared';
import { message as antMessage } from 'antd';
import { randomAsHex } from '@polkadot/util-crypto';
import { hexToU8a, isHex, isWasm, u8aToString } from '@polkadot/util';
import { CodeRx } from '@polkadot/api-contract';
import BN from 'bn.js';
import keyring from '@polkadot/ui-keyring';
import { AbiMessage } from '@polkadot/api-contract/types';
import { catchError } from 'rxjs/operators';
import { of,throwError } from 'rxjs';

const Wrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 60px 0px;
`;
const Form = styled.div`
  width: 480px;
  margin-bottom: 30px;
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

export const Deploy: FC<{ hash: string, signal: number }> = ({ hash, signal }): ReactElement => {
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

  const abi = useMemo(() => {
    store.loadAll();
    return store.getCode(hash)?.contractAbi;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, signal]);
  const [ message, setMessage ] = useState<AbiMessage | undefined>(abi?.constructors[0]);

  const deploy = useCallback(async () => {
    console.log('deploy: abi', abi, ' message', message);
    
    if (!abi || !isWasm(abi.project.source.wasm) || !message) {
      return;
    }

    
    const code = new CodeRx(api, abi, abi?.project.source.wasm);
    const value = (new BN(endowment)).mul((new BN(10)).pow(new BN(tokenDecimal)));
    console.log('salt:', salt, ',  endowment', value.toString(), ',  args', args, 'sender', address, ' gas:', (new BN(gasLimit)).mul(new BN(1000000)).toString());
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(new BN(1000000)),
      value,
      salt,
    }, ...args);

    const account = accounts.find(account => account.address === address);
    const suri = account?.mnemonic || `//${account?.name}`;
    const pair = keyring.createFromUri(suri);

    await tx.signAndSend(pair).pipe(
      catchError(e => {
        antMessage.error(e.message)
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

  console.log('render deploy')

  return (
    <Wrapper>
      {
        !abi ? 'Please upload the ABI first' :
          <div>
            <Form>
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
                onChange={
                  value => setState(pre => ({...pre, gasLimit: parseInt(value)}))
                }
                label="max gas allowed"
              />

              <AddressInput onChange={address => setState(pre => ({...pre, address}))} />
            </Form>
            <div>
              <ButtonPrimary onClick={deploy}>Deploy</ButtonPrimary>
            </div>
          </div>
      }
    </Wrapper>
  );
};
