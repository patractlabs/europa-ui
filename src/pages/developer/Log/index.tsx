import { FC, ReactElement, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { LogsContext } from '../../../core';
import { Style } from '../../../shared';

const Wrapper = styled.div`
  border: 1px solid ${Style.color.button.primary};
  padding: 20px;
  background-color: ${Style.color.bg.second};
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  bottom: 20px;
  left: 20px;
  top: 20px;
  right: 20px;
  > .line {
    padding-bottom: 6px;
    word-break: break-all;
  }
  > .line:last-child {
    padding-bottom: 0px;
  }
`;

export const Log: FC = (): ReactElement => { 
  const { logs } = useContext(LogsContext);

  useEffect(() => {
    const element = document.getElementById('log-container');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [logs]);

  return (
    <Wrapper id="log-container">
      {
        logs.map((log, index) =>
          <div key={index} className="line">{log}</div>
        )
      }
    </Wrapper>
  );
};
