import React, { FC, ReactElement, useContext } from 'react';
import { Select } from 'antd';
import { AccountsContext } from '../../core';

const { Option } = Select;

export const AddressInput: FC<{ defaultValue?: string; onChange: (address: string)  => void }> = ({ defaultValue, onChange }): ReactElement => {
  const { accounts } = useContext(AccountsContext);

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