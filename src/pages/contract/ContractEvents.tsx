import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { ExtendedExtrinsic, BlocksContext, PaginationProvider, ExtendedEventRecord } from '../../core';
import { Events } from '../../shared';
import { isRelatedCall, isRelatedInstantiation } from './ContractExtrinsics';

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
      .reduce((events: ExtendedEventRecord[], extrinsic) => events.concat(extrinsic.events), [])
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
