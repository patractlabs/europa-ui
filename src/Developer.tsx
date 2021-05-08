import { FC, ReactElement } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 68px;
`;

export const Developer: FC = (): ReactElement => {

  return (
    <Wrapper>
      Developer
    </Wrapper>
  );
};
