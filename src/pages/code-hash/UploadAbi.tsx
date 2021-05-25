import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, message, Modal, Upload } from 'antd';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import type { RcFile } from 'antd/lib/upload';
import { ApiContext, CodeJson, store } from '../../core';

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

export const UploadAbi: FC<{
  blockHeight: number;
  codeHash: string;
  show: boolean;
  onClose: () => void;
}> = ({ blockHeight, codeHash, show, onClose }): ReactElement => {
  const { genesisHash } = useContext(ApiContext);
  const [ codeJSON, setCodeJSON ] = useState<CodeJson>();

  const beforeUpload = useCallback(async (file: RcFile) => {
    try {
      const data = await file.arrayBuffer();
      const json = u8aToString(convertResult(data));
      setCodeJSON({
        abi: json,
        codeHash,
        name: file.name,
        genesisHash,
        tags: [],
        whenCreated: blockHeight,
      });
    } catch (error) {
      message.error('error');
      console.error(error);
    }

    return false;
  }, [blockHeight, genesisHash, codeHash]);

  const upload = useCallback(() => {
    if (!codeJSON) {
      return;
    }

    store.saveCode(codeHash, codeJSON);
    onClose();
  }, [codeJSON, codeHash, onClose]);

  return (
      <Modal
        visible={show}
        onCancel={onClose}
        onOk={upload}
      >
        <Upload beforeUpload={beforeUpload}>
          <Button>Upload</Button>
        </Upload>
      </Modal>
  );
};
