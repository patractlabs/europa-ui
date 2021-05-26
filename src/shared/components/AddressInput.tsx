import { Input, Select } from 'antd';
import React, { FC, ReactElement, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';
import { useAccounts } from '../../core';

const { Option } = Select;

export const AddressInput: FC<{ address: string; onChange: (address: string)  => void }> = ({ address, onChange }): ReactElement => {
  const { accounts } = useAccounts();

  // set default only once
  useEffect(() => {
    !address && onChange(accounts[0]?.address);
  }, [accounts]);

  return (
    <Select style={{ width: '100%' }} value={address} onChange={onChange}>
      {
        accounts.map(account =>
          <Option key={account.address} value={account.address}>{account.name} : {account.address}</Option>
        )
      }
    </Select>
  );
};