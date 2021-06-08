import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Tabs } from '../../../shared';

const Wrapper = styled.div``;

enum TabChoice {
  Functions = 'Functions',
  Extrinsics = 'Extrinsics',
  Events = 'Events',
}

export const Storage: FC = (): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Functions);

  return (
    <Wrapper>
      storage
    </Wrapper>
  );
};
