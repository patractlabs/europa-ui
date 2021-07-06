import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, message as antMessage, Modal, Upload } from 'antd';
import { Abi } from '@polkadot/api-contract';
import type { RcFile } from 'antd/lib/upload';
import { hexToU8a, isHex, isWasm, u8aToString } from '@polkadot/util';
import { handleTxResults, ApiContext, AccountsContext, CodeJson, store } from '../../core';
import { CodeRx } from '@polkadot/api-contract';
import keyring from '@polkadot/ui-keyring';
import BN from 'bn.js';
import { randomAsHex } from '@polkadot/util-crypto';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Constructor } from '../code-hash/Constructor';
import styled from 'styled-components';
import { AddressInput, ModalMain, ParamInput, Style } from '../../shared';
import { AbiMessage } from '@polkadot/api-contract/types';
import type { CodeSubmittableResult } from '@polkadot/api-contract/rx/types';
import LabeledInput from '../developer/shared/LabeledInput';
import LabeledValue from '../developer/shared/LabeledValue';
import MoreSvg from '../../assets/imgs/more.svg';
import { BN_MILLION, BN_TEN } from '@polkadot/util';
import type { Weight } from '@polkadot/types/interfaces';
import { RawParams } from '../../react-params/types';

const Content = styled(ModalMain)`
  .content {
    margin-top: 26px;

    .upload {
      width: 100%;
      text-align: center;
    }
    .params-input {
      margin-top: 16px;

      .form {
        margin: 20px 0px 30px 0px;
      }
    }
    .hint {
      margin-top: 16px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: ${Style.color.label.default};
    }
  }
`;

const DefaultButton = styled(Button)`
  width: 320px;
  height: 52px;
`;

interface AbiState {
  abiSource: string | null;
  abi: Abi | null;
  errorText: string | null;
  isAbiError: boolean;
  isAbiValid: boolean;
  isAbiSupplied: boolean;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const STR_NL = '\n';

function convertResult (result: ArrayBuffer): Uint8Array {
  const data = new Uint8Array(result);

  // this converts the input (if detected as hex), via the hex conversion route
  if (data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
    let hex = u8aToString(data);

    while (hex[hex.length - 1] === STR_NL) {
      hex = hex.substr(0, hex.length - 1);
    }

    if (isHex(hex)) {
      return hexToU8a(hex);
    }
  }

  return data;
}

const EMPTY: AbiState = {
  abi: null,
  abiSource: null,
  errorText: null,
  isAbiError: false,
  isAbiSupplied: false,
  isAbiValid: false
};

export const DeployModal: FC<{
  onCancel: () => void;
  onCompleted: () => void;
  abi?: Abi;
  contractName?: string;
}> = ({ abi: abiInput, onCancel, onCompleted, contractName }): ReactElement => {
  const { api, tokenDecimal, genesisHash } = useContext(ApiContext);
  const [ { abi }, setAbi ] = useState<AbiState>(EMPTY);
  const [ params, setParams ] = useState<RawParams>([]);
  const { accounts } = useContext(AccountsContext);
  const [ message, setMessage ] = useState<AbiMessage>();
  const [ codeJSON, setCodeJSON ] = useState<CodeJson>();
  const [ { sender, endowment, gasLimit, salt }, setState ] = useState<{
    sender: string;
    name: string;
    endowment: number;
    gasLimit: number;
    salt: string;
  }>({
    sender: accounts[0]?.address,
    name: '',
    endowment: 10,
    gasLimit: (api.consts.system.blockWeights
      ? api.consts.system.blockWeights.maxBlock
      : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN).toNumber(),
    salt: randomAsHex(),
  });

  const isDisabled = useMemo(() => {
    return !abi || !isWasm(abi.project.source.wasm) || !message || !endowment || !gasLimit || !sender || !params.every(param => param.isValid);
  }, [abi, message, endowment, gasLimit, sender,params]);

  useEffect(() => {
    setAbi({
      abiSource: null,
      abi: abiInput || null,
      errorText: null,
      isAbiError: false,
      isAbiSupplied: true,
      isAbiValid: true,
    });
    setCodeJSON({
      abi: '',
      codeHash: '',
      name: abiInput?.project?.contract?.name?.toString() || '',
      genesisHash: '',
      tags: [],
      whenCreated: 0,
    });
    setMessage(abiInput?.constructors[0]);
  }, [abiInput]);

  const onUpload = useCallback(async (file: RcFile) => {
    const data = await file.arrayBuffer();
    const json = u8aToString(convertResult(data));
    const abi = new Abi(json, api.registry.getChainProperties());

    try {
      setAbi({
        abiSource: json,
        abi,
        errorText: null,
        isAbiError: false,
        isAbiSupplied: true,
        isAbiValid: true
      });
      setCodeJSON({
        abi: json,
        codeHash: '',
        name: abi.project?.contract?.name?.toString() || file.name.split('.')[0],
        genesisHash,
        tags: [],
        whenCreated: 0,
      });
      setMessage(abi.constructors[0]);
    } catch (error) {
      console.error(error);

      setAbi({ ...EMPTY, errorText: (error as Error).message });
      setCodeJSON({
        abi: null,
        codeHash: '',
        name: '',
        genesisHash,
        tags: [],
        whenCreated: 0,
      });
      setMessage(undefined);
      setParams([]);
    }

    return false;
  }, [api, setCodeJSON, genesisHash]);

  const deploy = useCallback(async () => {
    if (!message) {
      return;
    }

    const code = new CodeRx(api, abi, abi?.project.source.wasm);
    const value = (new BN(endowment)).mul((BN_TEN).pow(new BN(tokenDecimal)));
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(BN_MILLION),
      value,
      salt,
    }, ...params.map(v => v.value as any));
    const account = accounts.find(account => account.address === sender);
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
        async success(result: CodeSubmittableResult) {
          const contract =  result.contract?.address.toString();

          antMessage.success('deployed');
          api.query.contracts.contractInfoOf(contract)
            .pipe(
              map(info => info.toHuman() as unknown as { Alive: { codeHash: string } } )
            )
            .subscribe(info => {
              const { Alive: { codeHash } }  = info;
              
              if (codeJSON) {
                store.saveCode(codeHash, codeJSON!);
              }
              onCompleted();
            });
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
  }, [abi, api, params, endowment, sender, accounts, gasLimit, message, salt, tokenDecimal, onCompleted, codeJSON]);

  return (
    <Modal
      width={560}
      title={null}
      onCancel={onCancel}
      visible={true}
      footer={null}
    >
      <Content>
        <div className="header">
          <h2>Upload & deploy contract</h2>
        </div>
        <div className="content">
          {
            !!abi &&
              <div className="params-input">
                <LabeledValue>
                  <div className="span">Contract name</div>
                  <div>{codeJSON?.name || contractName}</div>
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
                    style={{ margin: '16px 0px' }}
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
              </div>
          }
        </div>
        <div className="footer">
          {
            abi ?
              <DefaultButton disabled={isDisabled} type="primary" onClick={deploy}>Deploy</DefaultButton> :
              <Upload fileList={[]} beforeUpload={onUpload}>
                <DefaultButton type="primary">Upload ABI Bundle</DefaultButton>
              </Upload>
          }
        </div>
      </Content>
    </Modal>
  );
};
