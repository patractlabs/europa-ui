import React, { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';
import { ApiContext } from '../../core';
import { Button, ModalMain, Style } from '../../shared';
import styled from 'styled-components';

const Content = styled(ModalMain)`
  .content {
    text-align: center;
    .address {
      margin-top: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      color: ${Style.color.label.default};
    }
    .seed {
      margin-bottom: 16px;
    }
  }
  .footer {

  }
`;
const DefaultButton = styled(Button)`
  width: 320px;
`;
const DEFAULT_TYPE = 'sr25519';

export const CreateAccount: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }): ReactElement => {
  const { genesisHash } = useContext(ApiContext);
  const [ seed, setSeed ] = useState<string>('');
  const [ name, setName ] = useState<string>('');
  const [ address, setAddress ] = useState<string>('');

  useEffect(() => {
    const _seed = mnemonicGenerate(12);

    try {
      setAddress(keyring.createFromUri(_seed, {}, DEFAULT_TYPE).address);

    } catch (e) { console.log('e',e) }

    setSeed(_seed);
  }, []);

  const onCreate = useCallback(() => {
    try {
      const uri = keyring.addUri(seed, undefined, { genesisHash, name }, DEFAULT_TYPE);
      localStorage.setItem(`mnemonic${uri.json.address}`, seed);
      onClose();
    } catch (e) {}
  }, [seed, genesisHash, name, onClose]);

  return (
    <Modal
      width={610}
      title={null}
      onCancel={onClose}
      visible={open}
      footer={null}
    >
      <Content>
        <div className="header">
          <h2>Add New Account</h2>
        </div>
        <div className="content">
          <p className="address">{address}</p>
          <p className="seed">{seed}</p>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="footer">
          <DefaultButton onClick={onCreate}>Add</DefaultButton>
        </div>
      </Content>
    </Modal>
  );
};
