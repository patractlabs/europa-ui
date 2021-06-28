// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringOption$Type, KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { Select } from 'antd';
import { AccountInfo, AccountsContext } from '../../core';

interface Props {
  className?: string;
  defaultValue?: Uint8Array | string | null;
  filter?: string[];
  help?: React.ReactNode;
  hideAddress?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  isInput?: boolean;
  isMultiple?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  onChange?: (value: string | null) => void;
  onChangeMulti?: (value: string[]) => void;
  options?: KeyringSectionOption[];
  // optionsAll?: Record<string, Option[]>;
  placeholder?: string;
  type?: KeyringOption$Type;
  value?: string | Uint8Array | string[] | null;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

const { Option } = Select;

const InputAddress: FC<Props>  = ({ defaultValue, onChange, placeholder }): ReactElement => {
  const { accounts } = useContext(AccountsContext);
  const [ tempAccount, setTempAccount ] = useState<AccountInfo>({
    address: '',
    balance: '',
    mnemonic: '',
  });
  const accountsWithTemp = useMemo(
    () => tempAccount.address ? [...accounts, tempAccount] : [...accounts],
    [accounts, tempAccount],
  );

  const onSearch = useCallback((val) => {
    setTempAccount({
      address: val,
      balance: '',
      mnemonic: '',
    });
  }, []);

  return (
    
    <Select showSearch={true} onSearch={onSearch} autoClearSearchValue={false} placeholder={placeholder} defaultValue={defaultValue?.toString()} style={{ width: '100%' }} onChange={onChange}>
      {
        accountsWithTemp.map(account =>
          <Option key={account.address} value={account.address}>{account.name ? `${account.name} : ` : ''} {account.address}</Option>
        )
      }
    </Select>
  );
};

export default InputAddress;
