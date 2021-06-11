import { FC, ReactElement, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { LogContext } from '../../../core';
import { Style } from '../../../shared';

const Wrapper = styled.div`
  border: 1px solid ${Style.color.button.primary};
  padding: 20px;
  background-color: ${Style.color.bg.second};
  height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;

  > .line {
    padding-bottom: 6px;
    word-break: break-all;
  }
  > .line:last-child {
    padding-bottom: 0px;
  }
`;

export const Log: FC = (): ReactElement => { 
  const { logs } = useContext(LogContext);

  useEffect(() => {
    const element = document.getElementById('log-container');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [logs]);

  return (
    <Wrapper id="log-container">
      {
        logs.map(log =>
          <div className="line">{log}</div>
        )
      }
    </Wrapper>
  );
};
