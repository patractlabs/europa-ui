import { FC, ReactElement } from 'react';
import styled from 'styled-components';


const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 68px;
`;

// Vec<GenericExtrinsic<AnyTuple>>
export const Extrinsics: FC = (): ReactElement => {

  return (
    <Wrapper>
      Extrinsics
    </Wrapper>
  );
};
