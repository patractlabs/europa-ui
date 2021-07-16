import { FC, ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  name: string | ((pathname: string) => string) | ((pathname: string) => Promise<string>);
  link?: string;
}

// const concatPath = (divides: Divide[], index: number): string => {
//   return `/${divides.slice(0, index + 1).map(item => item.link).join('/')}`;
// };

export const BreadCrumb: FC<{
  divides: Divide[];
}> = ({ divides }): ReactElement => {
  const { pathname } = useLocation();

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
                <a style={{ cursor: 'default' }}>
                  {
                    typeof divide.name === 'string' ?
                      divide.name :
                      divide.name(pathname)
                  }
                </a>
                :
                <Link to={divide.link || ''}>
                  {
                    typeof divide.name === 'string' ?
                      divide.name :
                      divide.name(pathname)
                  }
                </Link>
            }
          </div>
        ))
      }
    </Wrapper>
  );
};
