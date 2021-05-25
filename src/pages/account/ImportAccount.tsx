import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import keyring from '@polkadot/ui-keyring';
import { ApiContext } from '../../core';

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
      visible={open} title="Import Account"
      onCancel={onClose}
      footer={[
        <Button key="oncreate" onClick={onImport}>Create</Button>
      ]}>
        <Input placeholder="mnemonic" value={seed} onChange={e => setSeed(e.target.value)} />
        <p>{address}</p>
        <Input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
    </Modal>
  );
};
