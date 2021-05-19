import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { BlocksContext, Extrinsic } from '../core/provider/blocks.provider';
import { PageSize } from '../shared/components/PageSize';
import { PaginationR } from '../shared/components/Pagination';
import { PaginationLine } from '../shared/components/PaginationLine';
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
