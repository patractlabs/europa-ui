import React, { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { message as antMessage, Modal, Upload } from 'antd';
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
import { AddressInput, ModalMain, ParamInput, Style, Button } from '../../shared';
import { AbiMessage } from '@polkadot/api-contract/types';
import type { CodeSubmittableResult } from '@polkadot/api-contract/rx/types';
import LabeledInput from '../developer/shared/LabeledInput';
import LabeledValue from '../developer/shared/LabeledValue';
import MoreSvg from '../../assets/imgs/more.svg';

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

export const UploadContract: FC<{
  onCancel: () => void;
  onCompleted: () => void;
  abi?: Abi;
  contractName?: string;
}> = ({ abi: abiInput, onCancel, onCompleted, contractName }): ReactElement => {
  const { api, tokenDecimal, genesisHash } = useContext(ApiContext);
  const [ { abi }, setAbi ] = useState<AbiState>(EMPTY);
  const [ args, setArgs ] = useState<any[]>([]);
  const { accounts } = useContext(AccountsContext);
  const [ message, setMessage ] = useState<AbiMessage>();
  const [ codeJSON, setCodeJSON ] = useState<CodeJson>();

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
    setArgs(abiInput?.constructors[0].args.map(() => undefined) || []);
  }, [abiInput]);

  const [ { address, endowment, gasLimit, salt }, setState ] = useState<{
    address: string;
    name: string;
    endowment: number;
    gasLimit: number;
    salt: string;
  }>({
    address: accounts[0]?.address,
    name: '',
    endowment: 10,
    gasLimit: 200000,
    // (api.consts.system.blockWeights
    //   ? api.consts.system.blockWeights.maxBlock
    //   : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN),
    salt: randomAsHex(),
  });

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
      setArgs(abi.constructors[0].args.map(() => undefined));
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
      setArgs([]);
    }

    return false;
  }, [api, setCodeJSON, genesisHash]);

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
          console.log('success')
          const contract =  result.contract?.address.toString();

          api.query.contracts.contractInfoOf(contract)
            .pipe(
              map(info => info.toHuman() as unknown as { Alive: { codeHash: string } } )
            )
            .subscribe(info => {
              const { Alive: { codeHash } }  = info;
              
              console.log('result', result, codeHash);
    
              antMessage.success('deployed');
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
  }, [abi, api, args, endowment, address, accounts, gasLimit, message, salt, tokenDecimal, onCompleted, codeJSON]);

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
          {/* {
            !abiInput &&
              <div className="upload">
                <Upload fileList={[]} beforeUpload={onUpload}>
                  {
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a style={{ marginBottom: '16px', width: '100%' }}>Upload Code Bundle</a>
                  }
                </Upload>
              </div>
          } */}
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
                    onParamsChange={setArgs}
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
                      onChange={address => setState(pre => ({...pre, address}))}
                    />
                  </LabeledInput>
                </div>
                {/* <LabeledInput>
                  <div className="span">code bundle name</div>
                  <Input value={name} onChange={e => setState(pre => ({...pre, name: e.target.value }))} />
                </LabeledInput> */}
              </div>
          }
        </div>
        <div className="footer">
          {
            codeJSON ?
              <DefaultButton onClick={deploy}>Deploy</DefaultButton> :
              <Upload fileList={[]} beforeUpload={onUpload}>
                <DefaultButton>Upload ABI Bundle</DefaultButton>
              </Upload>
          }
        </div>
      </Content>
    </Modal>
  );
};
