import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { BlocksContext } from '../../core';
import { Style } from '../../shared';
import JumpToBlock from './JumpToBlock';
import ConfirmBack from './ConfirmBack';
import Block from './Block';

const Wrapper = styled.div`
  background-color: rgb(248, 248, 248);

  .ant-table-tbody > tr > td {
    padding: 12px 20px;
  }
  .viewing-block {
    position: fixed;
    display: flex;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
    z-index: 10;
  }

  .not-viewing-block {
    position: static;
    display: block;
    z-index: 1;
    border-bottom: 1px solid ${Style.color.button.primary};
  }
`;

const NavigationHighlight = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  height: 78px;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
`;

export const NavigationGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  > .back {
    color: white;
    border-width: 0px;
    background: ${Style.color.label.primary};
    margin-right: 9px;
  }
  
  > .back:hover {
    opacity: 0.85;
  }
  > .back, > .forward {
    padding: 0px 33px;
    font-size: 15px;
    height: 52px;
  }
`;

export const Explorer: FC = (): ReactElement => {
  const { blocks: source } = useContext(BlocksContext);
  const [ viewingBlock, setViewingBlock ] = useState<string>('');
  const [ direction, setDirection ] = useState<'backward' | 'forward'>();
  const [ backHeight, setBackHeight ] = useState<number>(-1);

  const blocks = useMemo(() => ([...source].reverse()), [source])

  useEffect(() => {
    const toggleNavigation = () => {
      const _viewingBlock =  blocks.find(block => {
        const bounding = document.getElementById(block.blockHash)?.getBoundingClientRect();
        if (!bounding) {
          return false;
        }
        return bounding.top > -1 * bounding.height && bounding.top <= 0;
      });

      setViewingBlock(_viewingBlock?.blockHash || '');
    };
    document.addEventListener('scroll', toggleNavigation, false);
    
    return () => document.removeEventListener('scroll', toggleNavigation);
  }, [blocks, setViewingBlock]);

  return (
    <Wrapper>
      <NavigationHighlight>
        <NavigationGroup>
          <Button
            className="back"
            type="primary"
            onClick={() => {
              setDirection('backward');
            }}
          >Back to Block</Button>
          <Button
            className="forward"
            type="primary"
            onClick={() =>{
              setDirection('forward');
            }}
          >Go to Block</Button>
        </NavigationGroup>
      </NavigationHighlight>
      {
        blocks.map(block =>
          <Block block={block} viewing={viewingBlock === block.blockHash} onBack={setBackHeight} onJump={setDirection} />
        )
      }
      {
        !!direction &&
          <JumpToBlock direction={direction} onClose={() => setDirection(undefined)} />
      }
      {
        backHeight >=0 &&
          <ConfirmBack height={backHeight} onClose={() => setBackHeight(-1)} />
      }
    </Wrapper>
  );
};
