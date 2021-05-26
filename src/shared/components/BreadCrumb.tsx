import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 68px;

  a {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
`;

export interface Divide {
  name: string;
  path: string;
}

const concatPath = (divides: Divide[], index: number): string => {
  return `/${divides.slice(0, index + 1).map(item => item.path).join('/')}`;
};

export const BreadCrumb: FC<{
  divides: Divide[];
}> = ({ divides }): ReactElement => {

  if (!divides.length) {
    return <Wrapper />;
  }
  return (
    <Wrapper>
      <Link to={concatPath(divides, 0)}>
        {divides[0].name}
      </Link>
      {
        divides.slice(1).map((divide, index) => (
          <div key={index}>
            <span>&gt;</span>
            <Link to={concatPath(divides, index)}>
              {divide.name}
            </Link>
          </div>
        ))
      }
    </Wrapper>
  );
};
