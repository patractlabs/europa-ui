import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Select } from 'antd';
import { useAccounts } from '../../core';

const { Option } = Select;

export const AddressInput: FC<{ defaultValue?: string; onChange: (address: string)  => void }> = ({ defaultValue, onChange }): ReactElement => {
  const { accounts } = useAccounts();
  const [ value, setValue ] = useState<string>();

  // useEffect(() => {
  //   console.log('change', accounts[0]?.address, accounts)
  //   setValue(accounts[0]?.address);
  //   onChange(accounts[0]?.address);
  // }, [accounts]);
  // const _onChange = useCallback(value => {
  //   setValue(value);
  //   onChange(value);
  // }, []);

  return (
    <Select defaultValue={defaultValue} style={{ width: '100%' }} onChange={onChange}>
      {
        accounts.map(account =>
          <Option key={account.address} value={account.address}>{account.name} : {account.address}</Option>
        )
      }
    </Select>
  );
};