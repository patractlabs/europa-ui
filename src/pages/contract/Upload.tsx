import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, Input, Modal, Select, Upload } from 'antd';
import { Abi } from '@polkadot/api-contract';
import { ApiContext } from '../../core/provider/api.provider';
import type { RcFile } from 'antd/lib/upload';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import { useAccounts } from '../../core/hook/useAccounts';

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

export const UploadContract: FC<{
  onCancel: () => void;
  onCompleted: () => void;
  show: boolean;
}> = ({ onCancel, onCompleted, show }): ReactElement => {
  const { api } = useContext(ApiContext);
  const [ contractAbi, setContractAbi ] = useState<Abi>();
  const [ args, setArgs ] = useState<any[]>([]);
  const [ { address, name, endowment, masGas: maxGas }, setState ] = useState<{ address: string, name: string, endowment: number, masGas: number }>({} as any);
  const { accounts } = useAccounts();

  const onUpload = useCallback(async (file: RcFile) => {
    const data = await file.arrayBuffer();
    const json = u8aToString(convertResult(data));
    const abi = new Abi(json, api.registry.getChainProperties());

    setContractAbi(abi);

    console.log('abi', abi);
    setArgs(abi.constructors[0].args.map(() => undefined));

    return false;
  }, [api]);

  return (
    <Modal visible={show} onCancel={onCancel} footer={[
      <Button key="deploy">Deploy</Button>,
    ]}>
      <Upload beforeUpload={onUpload}>
        <Button>Upload</Button>
      </Upload>
      {
        contractAbi &&
          <div>
            {
              contractAbi.constructors.map(contractContructor =>
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
                contractAbi.constructors[0]?.args.map((arg, index)=>
                  <Input key={arg.name} placeholder={arg.name} value={args[index]} onChange={e => setArgs(values => ([...values].splice(index, 1, e.target.value)))} />
                )
              }
            </div>
          </div>
      }
      <div>
        account
        <Select style={{ width: '100%' }} defaultValue={accounts[0]?.address}>
          {
            accounts.map(account =>
              <Option key={account.address} value={account.address}>{account.address}</Option>
            )
          }
        </Select>
      </div>
      <div>
        code bundle name
        <Input value={name} onChange={e => setState(pre => ({...pre, name }))} />
      </div>
      <div>
        endowment
        <Input value={endowment} onChange={e => setState(pre => ({...pre, endowment }))} />
      </div>
      <div>
        max gas allowed (M)
        <Input value={maxGas} onChange={e => setState(pre => ({...pre, maxGas }))} />
      </div>
    </Modal>
  );
};
