import React, { FC, ReactElement, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { AbiParam } from '@polkadot/api-contract/types';
import findComponent from './findComponent';
import { ApiContext } from '../core';

const Wrapper = styled.div`
  > .param {
    font-size: 16px;
    font-weight: bold;
    color: #2A292B;
    padding-bottom: 8px;
  }
`;

export const Param: FC<{ arg: AbiParam, onChange: (value: unknown) => void }> = ({ arg, onChange }): ReactElement => {
  const { api } = useContext(ApiContext);
  const Component = useMemo(() => findComponent(api.registry, arg.type), [api, arg]);

  return (
    <Wrapper>
      <div className="param">
        {arg.name} : {arg.type.displayName || arg.type.type}
      </div>
      <Component defaultValue={{ isValid: true, value: '' }} onChange={value => onChange(value.value)} registry={api.registry} type={arg.type} />
    </Wrapper>
  );
};
