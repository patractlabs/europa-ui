import React, { FC, ReactElement,useContext, useMemo } from 'react';
import styled from 'styled-components';
import { PaginationProvider, BlocksContext, ExtendedExtrinsic, ExtendedEventRecord } from '../../core';
import { Events, Style } from '../../shared';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > .header {
    height: 48px;
    padding: 22px 20px 10px 20px;
    align-items: center;
    background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
    color: white;
    display: flex;
    font-weight: 600;

    > .event-name {
      width: 50%;
    }
    > .index {
      width: 50%;
    }
  }
`;

export const EventsPage: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const events = useMemo(() =>
    blocks.reduce((extrinsics: ExtendedExtrinsic[], block) => extrinsics.concat(block.extrinsics), [])
      .reduce((events: ExtendedEventRecord[], extrinsic) => events.concat(extrinsic.events), [])
      .reverse(),
    [blocks],
  );

  return (
    <Wrapper>
      <div className="header">
        <div className="event-name">Event</div>
        <div className="index">Index</div>
      </div>
      <PaginationProvider defaultPageSize={15}>
        <Events showIndex={true} paginationStyle={{ padding: '16px 20px 30px 20px' }} events={events} />
      </PaginationProvider>
    </Wrapper>
  );
};
