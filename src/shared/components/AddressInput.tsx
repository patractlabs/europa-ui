import React, { FC, ReactElement, useContext } from 'react';
import { Select } from 'antd';
import { AccountsContext } from '../../core';

const { Option } = Select;

export const AddressInput: FC<{
  suffixIcon?: React.ReactNode;
  bordered?: boolean;
  defaultValue?: string;
  onChange: (address: string)  => void;
}> = ({ suffixIcon = null, bordered = true, defaultValue, onChange }): ReactElement => {
  const { accounts } = useContext(AccountsContext);

  return (
    <Select suffixIcon={suffixIcon} bordered={bordered} defaultValue={defaultValue} style={{ width: '100%' }} onChange={onChange}>
      {
        accounts.map(account =>
          <Option key={account.address} value={account.address}>{account.name} : {account.address}</Option>
        )
      }
    </Select>
  );
};