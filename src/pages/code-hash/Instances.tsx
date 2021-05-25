import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useContracts, ApiContext, BlocksContext } from '../../core';

const Wrapper = styled.div`
  background-color: white;
`;

export const Instances: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);

  const relatedContracts = useMemo(() => contracts.filter(contract => contract.codeHash === hash), [contracts, hash]);

  return (
    <Wrapper>
      {
        relatedContracts.map(contract =>
          <div key={contract.address}>
            <Link to={`/explorer/contract/${contract.address}`}>{contract.address}</Link>&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
            <Link to={`/extrinsic/${contract.extrinsic.hash.toString()}/details`}>{contract.extrinsic.hash.toString()}</Link>
          </div>
        )
      }
    </Wrapper>
  );
};
