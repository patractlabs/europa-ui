import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { BlocksContext, Extrinsic } from '../../core';
import { PaginationLine, PaginationR, PageSize } from '../../shared';
import { ExtrinsicEvent } from './ExtrinsicEvent';

const Wrapper = styled.div`
  background-color: white;
`;
export const ExtrinsicEvents: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { hash } = useParams<{ hash: string }>();

  const events = useMemo(() =>
    blocks.reduce((extrinsics: Extrinsic[], block) => extrinsics.concat(block.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === hash)
      ?.events || [],
    [hash, blocks],
  );
 
  return (
    <Wrapper>
      {
        events.map(event =>
          <ExtrinsicEvent key={event.hash.toString()} event={event} />
        )
      }
      <PaginationLine>
        <PageSize />
        <PaginationR />
      </PaginationLine>
    </Wrapper>
  );
};
