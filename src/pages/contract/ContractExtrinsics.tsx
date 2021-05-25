import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { BlocksContext, Extrinsic, PaginationProvider } from '../../core';
import { contentBase, ExtendedExtrinsic, Extrinsics } from '../../shared';

const Wrapper = styled.div`
  ${contentBase}
`;

// const isTransfer = (extrinsic: Extrinsic, contractAddress: string): boolean => {};
export const isRelatedCall = (extrinsic: Extrinsic, contractAddress: string): boolean => {
  if (extrinsic.method.section.toLowerCase() !== 'contracts' || extrinsic.method.method.toLowerCase() !== 'call') {
    return false;
  }

  console.log('asdfasdf', extrinsic.args[0].toHuman(), contractAddress);
  
  return (extrinsic.args[0].toHuman() as { Id: string }).Id === contractAddress;
};
export const isRelatedInstantiation = (extrinsic: Extrinsic, contractAddress: string): boolean => {
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

export const ContractExtrinsics: FC<{ show: boolean, contractAddress: string }> = ({ show, contractAddress }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const extrinsics: ExtendedExtrinsic[] = useMemo(
    () => [...blocks]
      .reverse()
      .reduce((all: ExtendedExtrinsic[], block) => {
        const extrinsics = block.extrinsics.map(extrinsic =>
          Object.assign(extrinsic, {
            height: block.height,
          })
        );
        return all.concat(extrinsics);
      }, [])
      .filter(extrinsic =>
        isRelatedCall(extrinsic, contractAddress) || isRelatedInstantiation(extrinsic, contractAddress)
      ),
    [blocks, contractAddress],
  );

  return (
    <Wrapper style={{ display: show ? 'block' : 'none' }}>
      <PaginationProvider>
        <Extrinsics extrinsics={extrinsics} />
      </PaginationProvider>
    </Wrapper>
  );
};
