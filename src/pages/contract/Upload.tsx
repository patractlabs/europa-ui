import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, Input, message, Modal, Select, Upload } from 'antd';
import { Abi } from '@polkadot/api-contract';
import type { RcFile } from 'antd/lib/upload';
import { hexToU8a, isHex, isWasm, u8aToString } from '@polkadot/util';
import { handleTxResults, ApiContext, useAccounts } from '../../core';
import { CodeRx } from '@polkadot/api-contract';
import keyring from '@polkadot/ui-keyring';
import BN from 'bn.js';
import { randomAsHex } from '@polkadot/util-crypto';

interface AbiState {
  abiSource: string | null;
  abi: Abi | null;
  errorText: string | null;
  isAbiError: boolean;
  isAbiValid: boolean;
  isAbiSupplied: boolean;
}

const { Option } = Select;
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
  show: boolean;
}> = ({ onCancel, onCompleted, show }): ReactElement => {
  const { api, tokenDecimal } = useContext(ApiContext);
  const [ { abi }, setAbi ] = useState<AbiState>(EMPTY);
  const [ args, setArgs ] = useState<any[]>([]);
  const { accounts } = useAccounts();
  const [ { address, name, endowment, gasLimit }, setState ] = useState<{ address: string, name: string, endowment: number, gasLimit: number }>({
    address: accounts[0]?.address,
    name: 'xxx',
    endowment: 10,
    gasLimit: 200000,
    // (api.consts.system.blockWeights
    //   ? api.consts.system.blockWeights.maxBlock
    //   : api.consts.system.maximumBlockWeight as Weight).div(BN_MILLION).div(BN_TEN),
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
      setArgs(abi.constructors[0].args.map(() => 222));

    } catch (error) {
      console.error(error);

      setAbi({ ...EMPTY, errorText: (error as Error).message });
      setArgs([]);
    }

    return false;
  }, [api]);

  const deploy = useCallback(async () => {
    if (!abi || !isWasm(abi.project.source.wasm)) {
      return;
    }
    const code = new CodeRx(api, abi, abi?.project.source.wasm);

    const value = (new BN(endowment)).mul((new BN(10)).pow(new BN(tokenDecimal)));
    const tx = code.tx[abi.constructors[0].method]({
      gasLimit: 200000000000,
      // gasLimit: (new BN(gasLimit)).mul(new BN(1000000)),
      value,
      salt: randomAsHex(),
    }, args);

    console.log('send:', randomAsHex(), ',  endowment', value.toString(), ',  args', args, 'name', name);

    const account = accounts.find(account => account.address === address);
    const suri = account?.mnemonic || `//${account?.name}`;
    const pair = keyring.createFromUri(suri);

    await tx.signAndSend(pair).subscribe(
      handleTxResults({
        success() {
          message.success('deployed');
          onCompleted();
        },
        fail(e) {
          console.log(e.events.map(e => e.toHuman()));
          
          message.error('failed');
        },
        update(r) {
          message.info(r.events.map(e => e.toHuman()));
        }
      }, () => {})
    );
  }, [abi, api, args, endowment, address, accounts, onCompleted, tokenDecimal, name]);

  return (
    <Modal visible={show} onCancel={onCancel} footer={[
      <Button key="deploy" onClick={deploy}>Deploy</Button>,
    ]}>
      <Upload beforeUpload={onUpload}>
        <Button>Upload</Button>
      </Upload>
      {
        abi &&
          <div>
            {
              abi.constructors.map(contractContructor =>
                <div key={contractContructor.identifier}>
                  {contractContructor.method}&nbsp; (
                    <span key={contractContructor.args[0].name}>{contractContructor.args[0].name}:&nbsp;{contractContructor.args[0].type.displayName}</span>
                  {
                    contractContructor.args.slice(1).map(arg => <span key={arg.name}>, {arg.name}:&nbsp;{arg.type.displayName}</span>)
                  }
                  )
                </div>
              )
            }
            <div>
              {
                abi.constructors[0]?.args.map((arg, index)=>
                  <Input
                    key={arg.name}
                    placeholder={arg.name}
                    value={args[index]}
                    onChange={e => {
                      setArgs(
                        values => [...values].splice(
                          index,
                          1,
                          isNaN(parseFloat(e.target.value)) ?
                            0 : parseFloat(e.target.value)
                        )
                      )

                    }}
                  />
                )
              }
            </div>
          </div>
      }
      <div>
        account
        <Select style={{ width: '100%' }} value={address} onChange={value => setState(pre => ({...pre, address: value}))}>
          {
            accounts.map(account =>
              <Option key={account.address} value={account.address}>{account.name}-{account.address}</Option>
            )
          }
        </Select>
      </div>
      <div>
        code bundle name
        <Input value={name} onChange={e => setState(pre => ({...pre, name: e.target.value }))} />
      </div>
      <div>
        endowment
        <Input value={endowment} onChange={e => setState(pre => ({...pre, endowment: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value) }))} />
      </div>
      <div>
        max gas allowed (M)
        <Input value={gasLimit} onChange={e => setState(pre => ({...pre, gasLimit: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value) }))} />
      </div>
    </Modal>
  );
};
