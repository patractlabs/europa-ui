import { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { LogContext } from '../../../core';
import { Style } from '../../../shared';

const Wrapper = styled.div`
  border: 1px solid ${Style.color.border.default};
  padding: 15px;
  background-color: black;
  color: white;
  height: 450px;
  overflow-y: auto;
  overflow-x: hidden;

  > .line {
    padding: 6px 0px;
  }
`;

export const Log: FC = (): ReactElement => {
  const { logs } = useContext(LogContext);

  return (
    <Wrapper>
      {
        logs.map(log =>
          <div className="line">{log}</div>
        )
      }
    </Wrapper>
  );
};
