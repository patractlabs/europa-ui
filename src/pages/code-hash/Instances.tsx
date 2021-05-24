import { FC, ReactElement } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: white;
`;

export const Instances: FC<{ hash: string }> = ({ hash }): ReactElement => {



  return (
    <Wrapper>
      instances
    </Wrapper>
  );
};
