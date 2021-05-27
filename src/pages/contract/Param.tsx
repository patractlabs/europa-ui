import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { AbiParam } from '@polkadot/api-contract/types';
import { Input } from 'antd';

const Wrapper = styled.div`
  > .param {
    font-size: 16px;
    font-weight: bold;
    color: #2A292B;
    padding-bottom: 8px;
  }
`;

export const Param: FC<{ arg: AbiParam, value: string, onChange: (value: string) => void }> = ({ arg, value, onChange }): ReactElement => {

  return (
    <Wrapper>
      <div className="param">
        {arg.name} : {arg.type.displayName}
      </div>
      <Input placeholder={arg.name} value={value} onChange={e => onChange(e.target.value)} />
    </Wrapper>
  );
};
