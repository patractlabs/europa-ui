import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { PageLine } from './index';
import { Event } from './Event';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
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
      <div>
        {
          events.map((event, index) =>
            <Event key={index} event={event} />
          )
        }
      </div>
      <PageLine style={{ padding: '30px 20px' }} />
    </Wrapper>
  );
};
