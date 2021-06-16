import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BlocksContext, Extrinsic, PaginationProvider } from '../../core';
import { Events } from '../../shared';

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
    <PaginationProvider defaultPageSize={3} >
      <Events events={events} />
    </PaginationProvider>
  );
};
