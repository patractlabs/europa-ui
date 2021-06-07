import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { PageLine, PaginationR, PageSize } from '..';
import { Event } from './Event';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  background-color: white;
`;

export const Events: FC<{ events: EventRecord[] }> = ({ events: eventsSource }): ReactElement => {
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);
  const events = useMemo(
    () =>
    eventsSource.slice(pageSize * (pageIndex - 1), pageSize * pageIndex) || [],
    [eventsSource, pageIndex, pageSize],
  );

  useEffect(() => setTotal(eventsSource.length), [eventsSource, setTotal]);

  return (
    <Wrapper>
      {
        events.map((event, index) =>
          <Event key={index} event={event} />
        )
      }
      <PageLine style={{ marginTop: '16px' }}>
        <PageSize />
        <PaginationR />
      </PageLine>
    </Wrapper>
  );
};
