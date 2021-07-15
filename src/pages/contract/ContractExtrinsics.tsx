import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { BlocksContext, ExtendedExtrinsic, PaginationProvider } from '../../core';
import { Extrinsics } from '../../shared';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
`;

// const isTransfer = (extrinsic: Extrinsic, contractAddress: string): boolean => {};
export const isRelatedCall = (extrinsic: ExtendedExtrinsic, contractAddress: string): boolean => {
  if (extrinsic.method.section.toLowerCase() !== 'contracts' || extrinsic.method.method.toLowerCase() !== 'call') {
    return false;
  }
  
  return (extrinsic.args[0].toHuman() as { Id: string }).Id === contractAddress;
};

export const isRelatedInstantiation = (extrinsic: ExtendedExtrinsic, contractAddress: string): boolean => {
  if (extrinsic.method.section.toLowerCase() !== 'contracts' ||
    (extrinsic.method.method.toLowerCase() !== 'instantiate' &&
      extrinsic.method.method.toLowerCase() !== 'instantiatewithcode')
  ) {
    return false;
  }

  const event = extrinsic.events.find(({ event: { method, section } }) =>
    section === 'contracts' && method === 'Instantiated'
  );

  return event?.event.data[1].toString() === contractAddress;
};

export const ContractExtrinsics: FC<{ contractAddress: string }> = ({ contractAddress }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const extrinsics: ExtendedExtrinsic[] = useMemo(
    () => [...blocks]
      .reverse()
      .reduce((all: ExtendedExtrinsic[], block) => all.concat(block.extrinsics), [])
      .filter(extrinsic =>
        isRelatedCall(extrinsic, contractAddress) || isRelatedInstantiation(extrinsic, contractAddress)
      ),
    [blocks, contractAddress],
  );

  return (
    <Wrapper>
      <PaginationProvider>
        <Extrinsics extrinsics={extrinsics} />
      </PaginationProvider>
    </Wrapper>
  );
};
