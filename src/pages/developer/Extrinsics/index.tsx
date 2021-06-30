import React, { FC, ReactElement, useState } from 'react';
import { Tabs } from '../../../shared';
import PageWrapper from '../shared/PageWrapper';
import { Decode } from './Decode';
import { Submission } from './Submission';

enum TabChoice {
  Submission = 'Submission',
  Decode = 'Decode',
}

export const Extrinsic: FC = (): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Submission);

  return (
    <PageWrapper>
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
    </PageWrapper>
  );
};
