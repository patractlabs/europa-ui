import React, { FC, ReactElement, useContext, useState } from 'react';
import { ApiRx } from '@polkadot/api';
import styled from 'styled-components';
import { ApiContext } from '../../../core';

const Wrapper = styled.div``;

enum TabChoice {
  Functions = 'Functions',
  Extrinsics = 'Extrinsics',
  Events = 'Events',
}
const createOptions = (api: ApiRx): string[] => {
  return Object
    .keys(api.consts)
    .sort()
    .filter((name): number => Object.keys(api.consts[name]).length);
}



export const Storage: FC = (): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Functions);
  const { api } = useContext(ApiContext);

  return (
    <Wrapper>
      
    </Wrapper>
  );
};
