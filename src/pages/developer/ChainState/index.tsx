import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Tabs } from '../../../shared';
import { Constants } from './Constants';
import { RawStorage } from './RawStorage';
import { Storage } from './Storage';

const Wrapper = styled.div``;

enum TabChoice {
  Storage = 'Storage',
  Constants = 'Constants',
  RawStorage = 'RawStorage',
}

export const ChainState: FC = (): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Storage);

  return (
    <Wrapper>
      <Tabs
        style={{ marginTop: '20px' }}
        options={[
          { name: 'Storage', value: TabChoice.Storage },
          { name: 'Constants', value: TabChoice.Constants },
          { name: 'Raw Storage', value: TabChoice.RawStorage },
        ]}
        defaultValue={TabChoice.Storage}
        onChange={choice => setTabChoice(choice)}
      ></Tabs>
      {
        tabChoice === TabChoice.Storage &&
          <Storage />
      }
      {
        tabChoice === TabChoice.Constants &&
          <Constants />
      }
      {
        tabChoice === TabChoice.RawStorage &&
          <RawStorage />
      }
    </Wrapper>
  );
};
