import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { Style } from '../styled';
import { TitleWithBottomBorder } from '../styled/TitleWithBottom';

interface Pair {
  label: string;
  render: ReactElement;
  align?: 'left' | 'right';
}

const Paired = styled.div<{ align: string}>`
  .label {
    color: ${Style.color.label.default};
    text-align: ${props => props.align};
  }
  .value {
    text-align: ${props => props.align};
  }
`;
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;


export const InfoHeader: FC<{ pairs: Pair[]  }> = ({ pairs }): ReactElement => {

  return (
    <TitleWithBottomBorder>
      <Wrapper>
        {
          pairs.map((pair, index) =>
            <Paired key={index} align={pair.align || 'left'}>
              <div className="label">{pair.label}</div>
              <div className="value">
                {
                  pair.render
                }
              </div>
            </Paired>
          )
        }
      </Wrapper>
    </TitleWithBottomBorder>
  );
};
