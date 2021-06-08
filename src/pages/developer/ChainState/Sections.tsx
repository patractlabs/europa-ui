import { Select } from 'antd';
import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { ApiContext } from '../../../core';

const Wrapper = styled.div``;

const { Option } = Select;
const StyledSelected = styled(Select)`
  width: 100%;
  height: 48px;
  > .ant-select-selector {
    height: 48px !important;
  }
`;
export const Sections: FC<{ options: string[], onChange: (option: string) => void }> = ({ options, onChange }): ReactElement => {
  const { api } = useContext(ApiContext);

  return (
    <StyledSelected onChange={onChange as any}>
      {
        options.map((option, index) =>
          <Option value={option} key={index}>{option}</Option>
        )
      }
    </StyledSelected>
  );
};
