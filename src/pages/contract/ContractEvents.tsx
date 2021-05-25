import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { BlocksContext, PaginationProvider } from '../../core';
import { contentBase, Events, ExtendedExtrinsic } from '../../shared';
import { isRelatedCall, isRelatedInstantiation } from './ContractExtrinsics';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  ${contentBase}
`;

export const ContractEvents: FC<{ show: boolean, contractAddress: string }> = ({ show, contractAddress }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const events = useMemo(() =>
    blocks.reduce((all: ExtendedExtrinsic[], block) => {
      const extrinsics = block.extrinsics.map(extrinsic =>
        Object.assign(extrinsic, {
          height: block.height,
        })
      );
      return all.concat(extrinsics);
    }, [])
    .filter(extrinsic =>
      isRelatedCall(extrinsic, contractAddress) || isRelatedInstantiation(extrinsic, contractAddress)
    )
    .reduce((events: EventRecord[], extrinsic) => events.concat(extrinsic.events), [])
    .reverse(),
    [contractAddress, blocks],
  );

  return (
    <Wrapper style={{ display: show ? 'block' : 'none' }}>
      <PaginationProvider>
        <Events events={events} />
      </PaginationProvider>
    </Wrapper>
  );
};
