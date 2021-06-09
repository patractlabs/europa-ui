import React, { FC, ReactElement } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';

const StyledSelected = styled(Select)`
  width: 100%;
  height: 48px;
  > .ant-select-selector {
    height: 48px !important;
  }
`;
const { Option } = Select;

export const Methods: FC<{
  value: {
    value: string;
    label: string;
    desc: string;
  };
  options: {
    value: string;
    label: string;
    desc: string;
  }[];
  onChange: (option: {
    value: string;
    label: string;
    desc: string;
  }) => void;
}> = ({ value, options, onChange }): ReactElement => {

  return (
    <StyledSelected value={value.value} onChange={value => onChange(options.find(item => item.value === value)!)}>
      {
        options.map(option =>
          <Option value={option.value} key={option.value}>{option.label}</Option>
        )
      }
    </StyledSelected>
  );
};
