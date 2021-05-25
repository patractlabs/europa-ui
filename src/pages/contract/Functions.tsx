import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { contentBase } from '../../shared';

const Wrapper = styled.div`
  ${contentBase}
`;

export const Functions: FC<{ show: boolean, contractAddress: string }> = ({ show, contractAddress }): ReactElement => {
  // const { api } = useContext(ApiContext);
  // const { blocks } = useContext(BlocksContext);
  // const { contracts } = useContracts(api, blocks);
  // const { address } = useParams<{ address: string }>();

  return (
    <Wrapper style={{ display: show ? 'block' : 'none' }}>
      Functrions
    </Wrapper>
  );
};
