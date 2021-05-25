import React, { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';
import { ApiContext } from '../../core';

const DEFAULT_TYPE = 'sr25519';

export const CreateAccount: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }): ReactElement => {
  const { genesisHash } = useContext(ApiContext);
  const [ seed, setSeed ] = useState<string>('');
  const [ name, setName ] = useState<string>('');
  const [ address, setAddress ] = useState<string>('');

  useEffect(() => {
    const _seed = mnemonicGenerate(12);

    console.log('seed', _seed);
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
      visible={open} title="Add Account"
      onCancel={onClose}
      footer={[
        <Button key="oncreate" onClick={onCreate}>Create</Button>
      ]}>
        <h4>mnemonic: </h4>
        <p>{seed}</p>
        <p>{address}</p>
        <Input value={name} onChange={e => setName(e.target.value)} />
    </Modal>
  );
};
