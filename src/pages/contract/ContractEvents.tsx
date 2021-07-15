import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { ExtendedExtrinsic, BlocksContext, PaginationProvider } from '../../core';
import { Events } from '../../shared';
import { isRelatedCall, isRelatedInstantiation } from './ContractExtrinsics';
import type { EventRecord } from '@polkadot/types/interfaces/system';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
`;

export const ContractEvents: FC<{ contractAddress: string }> = ({ contractAddress }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const events = useMemo(() =>
    blocks.reduce((all: ExtendedExtrinsic[], block) => all.concat(block.extrinsics), [])
      .filter(extrinsic =>
        isRelatedCall(extrinsic, contractAddress) || isRelatedInstantiation(extrinsic, contractAddress)
      )
      .reduce((events: EventRecord[], extrinsic) => events.concat(extrinsic.events), [])
      .reverse(),
    [contractAddress, blocks],
  );

  return (
    <Wrapper>
      <PaginationProvider>
        <Events showIndex={true} events={events} />
      </PaginationProvider>
    </Wrapper>
  );
};
