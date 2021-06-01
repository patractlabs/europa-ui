import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 68px;
  color: white;

  > div {
    display: flex;
    align-items: center;

    > span {
      margin: 0px 6px;
    }
  }
  a {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
`;

export interface Divide {
  name: string;
  link?: string;
}

// const concatPath = (divides: Divide[], index: number): string => {
//   return `/${divides.slice(0, index + 1).map(item => item.link).join('/')}`;
// };

export const BreadCrumb: FC<{
  divides: Divide[];
}> = ({ divides }): ReactElement => {

  if (!divides.length) {
    return <Wrapper />;
  }
  return (
    <Wrapper>
      {
        divides.map((divide, index) => (
          <div key={index}>
            {
              !!index &&
                <span>&gt;</span>
            }
            {
              index === divides.length - 1 ?
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a>
                  {divide.name}
                </a>
                :
                <Link to={divide.link || ''}>
                  {divide.name}
                </Link>
            }
          </div>
        ))
      }
    </Wrapper>
  );
};
