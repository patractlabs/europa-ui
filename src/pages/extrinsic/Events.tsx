import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BlocksContext, ExtendedExtrinsic, PaginationProvider } from '../../core';
import { Events } from '../../shared';

export const ExtrinsicEvents: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { hash } = useParams<{ hash: string }>();

  const events = useMemo(() =>
    blocks.reduce((extrinsics: ExtendedExtrinsic[], block) => extrinsics.concat(block.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === hash)
      ?.events || [],
    [hash, blocks],
  );

  return (
    <PaginationProvider>
      <Events showIndex={true} events={events} />
    </PaginationProvider>
  );
};
