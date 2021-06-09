import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Tabs } from '../../../shared';
import { Decode } from './Decode';
import { Submission } from './Submission';

const Wrapper = styled.div``;

enum TabChoice {
  Submission = 'Submission',
  Decode = 'Decode',
}

export const Extrinsic: FC = (): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Submission);

  return (
    <Wrapper>
      <Tabs
        style={{ marginTop: '20px' }}
        options={[
          { name: 'Submission', value: TabChoice.Submission },
          { name: 'Decode', value: TabChoice.Decode },
        ]}
        defaultValue={TabChoice.Submission}
        onChange={choice => setTabChoice(choice)}
      ></Tabs>
      {
        tabChoice === TabChoice.Submission &&
          <Submission />
      }
      {
        tabChoice === TabChoice.Decode &&
          <Decode />
      }
    </Wrapper>
  );
};
