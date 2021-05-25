import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { PaginationLine, PaginationR, PageSize } from '..';
import { Event } from './Event';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  background-color: white;
`;

export const Events: FC<{ events: EventRecord[] }> = ({ events: eventsSource }): ReactElement => {
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  useEffect(() => setTotal(eventsSource.length), [eventsSource, setTotal]);

  const events = useMemo(
    () =>
      eventsSource.slice(pageSize * (pageIndex - 1), pageSize * pageIndex) || [],
    [eventsSource, pageIndex, pageSize],
  );


  return (
    <Wrapper>
      {
        events.map(event =>
          <Event key={event.hash.toString()} event={event} />
        )
      }
      <PaginationLine>
        <PageSize />
        <PaginationR />
      </PaginationLine>
    </Wrapper>
  );
};
