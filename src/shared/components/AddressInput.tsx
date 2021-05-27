import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Select } from 'antd';
import { useAccounts } from '../../core';

const { Option } = Select;

export const AddressInput: FC<{ onChange: (address: string)  => void }> = ({ onChange }): ReactElement => {
  const { accounts } = useAccounts();
  const [ value, setValue ] = useState<string>();

  // const _onChange = useCallback(value => {
  //   // setValue(value);
  //   // onChange(value);
  // }, [setValue, onChange]);

  return (
    <Select style={{ width: '100%' }} onChange={onChange}>
      {
        accounts.map(account =>
          <Option key={account.address} value={account.address}>{account.name} : {account.address}</Option>
        )
      }
    </Select>
  );
};