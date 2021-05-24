import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useContracts } from '../../core/hook/useContracts';
import { ApiContext } from '../../core/provider/api.provider';
import { BlocksContext } from '../../core/provider/blocks.provider';

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
