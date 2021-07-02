import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message, Modal, Upload } from 'antd';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import type { RcFile } from 'antd/lib/upload';
import { ApiContext, CodeJson, store } from '../../core';
import styled from 'styled-components';
import { ModalMain, Button, Style } from '../../shared';
import LabeledValue from '../developer/shared/LabeledValue';
import { Abi } from '@polkadot/api-contract';

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

export const UploadAbi: FC<{
  blockHeight: number;
  codeHash: string;
  onCanceled: () => void;
  onCompleted: () => void;
}> = ({ blockHeight, codeHash, onCanceled, onCompleted }): ReactElement => {
  const { genesisHash } = useContext(ApiContext);
  const [ codeJSON, setCodeJSON ] = useState<CodeJson>();

  const beforeUpload = useCallback(async (file: RcFile) => {
    try {
      const data = await file.arrayBuffer();
      const json = u8aToString(convertResult(data));
      const abi = new Abi(json);
      const hash = abi.project?.source?.wasmHash?.toString();

      if (hash !== codeHash) {
        message.error('Code hash is not equal')
      }

      setCodeJSON({
        abi: json,
        codeHash: hash,
        name: abi.project?.contract?.name?.toString() || file.name.split('.')[0],
        genesisHash,
        tags: [],
        whenCreated: blockHeight,
      });
    } catch (error) {
      message.error('Please upload .contact file');
      console.error(error);
    }

    return false;
  }, [blockHeight, genesisHash, codeHash]);

  const upload = useCallback(() => {
    if (!codeJSON || (codeJSON.codeHash && codeJSON.codeHash !== codeHash)) {
      return;
    }

    store.saveCode(codeHash, codeJSON);
    onCompleted();
  }, [codeJSON, codeHash, onCompleted]);

  return (
      <Modal
        width={560}
        title={null}
        onCancel={onCanceled}
        visible={true}
        footer={null}
      >
        <Content>
          <div className="header">
            <h2>Upload ABI bundle</h2>
          </div>
          <div className="content">
            <div className="upload">
              <div>
                <LabeledValue style={{ marginTop: '16px', paddingRight: '16px', width: '100%', textAlign: 'left' }}>
                  <div className="span">Contract name</div>
                  <div>{codeJSON?.name}</div>
                </LabeledValue>

                <LabeledValue error={!!codeJSON && !!codeJSON.codeHash && codeJSON.codeHash !== codeHash} style={{ marginTop: '16px', paddingRight: '16px', width: '100%', textAlign: 'left' }}>
                  <div className="span">Contract code hash</div>
                  <div className="value">{codeJSON?.codeHash}</div>
                </LabeledValue>
              </div>
            </div>
          </div>
          <div className="footer">
            {
              codeJSON ?
                <DefaultButton disabled={codeJSON.codeHash !== codeHash} onClick={upload}>Confirm</DefaultButton> :
                <Upload fileList={[]} beforeUpload={beforeUpload}>
                  <DefaultButton>Upload ABI Bundle</DefaultButton>
                </Upload>
            }
          </div>
        </Content>
      </Modal>
  );
};
