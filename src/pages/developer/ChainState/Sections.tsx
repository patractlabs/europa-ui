import React, { FC, ReactElement } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';

const { Option } = Select;
const StyledSelected = styled(Select)`
  width: 100%;
  height: 48px;
  > .ant-select-selector {
    height: 48px !important;
  }
`;
export const Sections: FC<{
  defaultValue?: string;
  options: string[];
  onChange: (option: string) => void;
}> = ({ defaultValue, options, onChange }): ReactElement => {

  return (
    <StyledSelected defaultValue={defaultValue} onChange={onChange as any}>
      {
        options.map((option, index) =>
          <Option value={option} key={index}>{option}</Option>
        )
      }
    </StyledSelected>
  );
};
