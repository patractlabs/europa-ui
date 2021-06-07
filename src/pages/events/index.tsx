import React, { FC, ReactElement,useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import { PaginationProvider, BlocksContext, Extrinsic,  } from '../../core';
import { Events } from '../../shared';

const Wrapper = styled.div`
`;

export const EventsPage: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const events = useMemo(() =>
    blocks.reduce((extrinsics: Extrinsic[], block) => extrinsics.concat(block.extrinsics), [])
      .reduce((events: EventRecord[], extrinsic) => events.concat(extrinsic.events), [])
      .reverse(),
    [blocks],
  );

  return (
    <Wrapper>
      <PaginationProvider>
        <Events events={events} />
      </PaginationProvider>
    </Wrapper>
  );
};
