import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Upload } from 'antd';
import { Abi } from '@polkadot/api-contract';
import type { RcFile } from 'antd/lib/upload';
import { hexToU8a, isHex, isWasm, u8aToString } from '@polkadot/util';
import { handleTxResults, ApiContext, AccountsContext, CodeJson, store } from '../../core';
import { CodeRx } from '@polkadot/api-contract';
import { keyring } from '@polkadot/ui-keyring';
import BN from 'bn.js';
import { randomAsHex } from '@polkadot/util-crypto';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Constructor } from '../code-hash/Constructor';
import styled from 'styled-components';
import { TxError, AddressInput, ModalMain, notification, ParamInput, Style } from '../../shared';
import { AbiMessage } from '@polkadot/api-contract/types';
import type { CodeSubmittableResult } from '@polkadot/api-contract/rx/types';
import LabeledInput from '../developer/shared/LabeledInput';
import LabeledValue from '../developer/shared/LabeledValue';
import MoreSvg from '../../assets/imgs/more.svg';
import { BN_MILLION, BN_TEN } from '@polkadot/util';
import type { Weight } from '@polkadot/types/interfaces';
import { RawParams } from '../../react-params/types';
import { InputBalance } from '../../react-components';
import type { ApiRx } from '@polkadot/api';

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

export function getEstimatedGas(api: ApiRx) {
  return (api.consts.system.blockWeights
    ? api.consts.system.blockWeights.maxBlock
    : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN).toNumber()
}

export const DeployModal: FC<{
  onCancel: () => void;
  onCompleted: () => void;
  abi?: Abi;
  contractName?: string;
}> = ({ abi: abiInput, onCancel, onCompleted, contractName }): ReactElement => {
  const { api, tokenDecimal, genesisHash, metadata } = useContext(ApiContext);
  const [ { abi }, setAbi ] = useState<AbiState>(EMPTY);
  const [ params, setParams ] = useState<RawParams>([]);
  const { accounts } = useContext(AccountsContext);
  const [ message, setMessage ] = useState<AbiMessage>();
  const [ codeJSON, setCodeJSON ] = useState<CodeJson>();
  const [ endowment, setEndowment ] = useState<BN>();
  const [ tip, setTip ] = useState<BN>();
  const [ { sender, gasLimit, salt }, setState ] = useState<{
    sender: string | undefined;
    gasLimit: number;
    salt: string;
  }>({
    sender: accounts[0]?.address,
    gasLimit: getEstimatedGas(api),
    salt: randomAsHex(),
  });

  const isDisabled = useMemo(() => {
    return !abi || !isWasm(abi.project.source.wasm) || !message || !endowment || endowment.toNumber() === 0 || !gasLimit || !sender || !params.every(param => param.isValid);
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
    const tx = code.tx[message.method]({
      gasLimit: (new BN(gasLimit)).mul(BN_MILLION),
      value: endowment,
      salt,
    }, ...params.map(v => v.value as any));
    const account = accounts.find(account => account.address === sender);
    if (!account) {
      return
    }
    const pair = account.mnemonic ? keyring.createFromUri(account.mnemonic) : keyring.getPair(account.address);

    setState(old => ({ ...old, salt: randomAsHex() }));

    await tx.signAndSend(pair, { tip }).pipe(
      catchError(e => {
        notification.fail({
          message: 'Failed',
          description: e.message,
        });
        return throwError('');
      })
    ).subscribe(
      handleTxResults({
        async success(result: CodeSubmittableResult) {
          const contract =  result.contract?.address.toString();

          notification.success({
            message: 'Deployed',
            description: 'Contract deployed',
          });
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
  }, [abi, api, params, endowment, sender, accounts, gasLimit, message, salt, onCompleted, codeJSON, tip, metadata]);

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
          <h2>{
            !!abi ?
              'Deploy Contract':
              'Upload & Deploy Contract'
          }</h2>
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
                  
                  <LabeledInput style={{ borderBottom: '0px', marginTop: '16px' }}>
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
                    style={{ borderBottomWidth: '0px' }}
                    defaultValue={gasLimit}
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
              </div>
          }
        </div>
        <div className="footer">
          {
            abi ?
              <DefaultButton disabled={isDisabled} type="primary" onClick={deploy}>Deploy</DefaultButton> :
              <Upload fileList={[]} beforeUpload={onUpload}>
                <DefaultButton type="primary">Upload</DefaultButton>
              </Upload>
          }
        </div>
      </Content>
    </Modal>
  );
};
