import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { PaginationProvider, BlocksContext } from '../../core';
import { ExtendedExtrinsic, Extrinsics } from '../../shared';
import { Route, Switch } from 'react-router-dom';
import { ExtrinsicDetailPage } from './DetailPage';

const ExtrinsicsR: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const extrinsics: ExtendedExtrinsic[] = useMemo(
    () => [...blocks].reverse().reduce((all: ExtendedExtrinsic[], block) => {
      const extrinsics = block.extrinsics.map(extrinsic => Object.assign(extrinsic, {
        height: block.height,
      }));
      return all.concat(extrinsics);
    }, []),
    [blocks],
  );

  return (
    <PaginationProvider>
      <Extrinsics extrinsics={extrinsics} />
    </PaginationProvider>
  );
};

export const ExtrinsicPage: FC = (): ReactElement => {
  return (
    <Switch>
      <Route path='/extrinsic/:hash/:part'>
        <ExtrinsicDetailPage />
      </Route>
      <Route path='/extrinsic' exact>
        <ExtrinsicsR />
      </Route>
    </Switch>
  );
}
