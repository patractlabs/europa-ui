import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { keyring } from '@polkadot/ui-keyring';
import { ApiContext } from '../../core';
import { ModalMain, Style } from '../../shared';
import styled from 'styled-components';
import LabeledInput from '../developer/shared/LabeledInput';

const Content = styled(ModalMain)`
  .content {
    .address {
      text-align: center;
      height: 22px;
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
export const ImportAccount: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }): ReactElement => {
  const { genesisHash } = useContext(ApiContext);
  const [ seed, setSeed ] = useState<string>('');
  const [ name, setName ] = useState<string>('');
  const [ address, setAddress ] = useState<string>('');

  useMemo(() => {
    try {
      setAddress(keyring.createFromUri(seed, {}).address);
    } catch (e) { console.log('e',e) }
  }, [seed]);

  const onImport = useCallback(() => {
    try {
      const uri = keyring.addUri(seed, undefined, { genesisHash, name });
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
          <h2>Import New Account</h2>
        </div>
        <div className="content">
          <p className="address">{address}</p>
          <LabeledInput className="seed">
            <div className="span">mnemonic seed</div>
            <Input value={seed} onChange={e => setSeed(e.target.value)} />
          </LabeledInput>
          <LabeledInput>
            <div className="span">name</div>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </LabeledInput>
        </div>
        <div className="footer">
          <DefaultButton disabled={!name || !seed} type="primary" onClick={onImport}>Import</DefaultButton>
        </div>
      </Content>
    </Modal>
  );
};
