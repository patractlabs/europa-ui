import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import { Button, Table } from 'antd';
import styled from 'styled-components';
import EnterSVG from '../../assets/imgs/return.svg';
import MoveSVG from '../../assets/imgs/more.svg';
import EventsSVG from '../../assets/imgs/events.svg';
import { Block, BlocksContext } from '../../core';
import { Style, Transfer } from '../../shared';
import JumpToBlock from './JumpToBlock';
import ConfirmBack from './ConfirmBack';

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
const BlockWrapper = styled.div`
  margin-bottom: 0px;
  padding-bottom: 20px;

  .ant-table-thead > tr > th {
    background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  }
`;
const BlockInfoWrapper = styled.div`
  width: 100%;
  background: white;
  z-index: 1;
  top: 0px;
  padding: 14px 18px;
  justify-content: space-between;

  > .block-info {
    overflow: hidden;
    margin-right: 20px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;

    > .left {
      > .block-name {
        > span {
          font-size: 14px;
          color: ${Style.color.label.default};
          line-height: 16px;
        }
        > h4 {
          display: flex;
          align-items: center;
          height: 24px;
          font-size: 24px;
          font-weight: bold;
          line-height: 24px;
          
          > img {
            width:  20px;
            height: 20px;
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }
    }
    > p {
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 0px 40px;
      font-size: 16px;
      color: ${Style.color.label.primary};
    }
    > .extrinsics {
      width: 120px;
      > span {
        font-size: 14px;
        color: ${Style.color.label.default};
        line-height: 16px;
      }
      > h4 {
        height: 24px;
        font-size: 24px;
        font-weight: bold;
        color: ${Style.color.label.primary};
        line-height: 24px;
      }
    }
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
const NavigationGroup = styled.div`
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

const ShowMore = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  background: #EFEFEF;
  font-size: 14px;
  font-weight: bold;
  color: ${Style.color.primary};

  > img {
    margin-right: 4px;
  }
`;

const SpaceFill = styled.div<{ viewing: boolean }>`
  display: ${props => props.viewing ? 'block': 'none'};
  height: 78px;
`;

const Events = styled.div`
  width: 120px;
  display: inline-flex;
  align-items: center;

  > img {
    margin-right: 10px;
    width: 20px;
    height: 20px;
  }
`;

const BlockInfo: FC<{
  currentBlock: Block;
  viewing: boolean;
  backward: () => void;
  forward: () => void;
  onBack: (height: number) => void;
}> = ({
  currentBlock,
  viewing,
  backward,
  forward,
  onBack,
}): ReactElement => {
  return (
    <BlockInfoWrapper className={ viewing ? 'viewing-block' : 'not-viewing-block' }>
      <div className="block-info">
        <div className="left">
          <div className="block-name">
            <span>Block</span>
            <h4>
              <Link to={`/block/${currentBlock?.blockHash}`}>{currentBlock?.height}</Link>
              <img onClick={() => onBack(currentBlock?.height)} src={EnterSVG} alt=""/>
            </h4>
          </div>
        </div>
        <p>
          {currentBlock?.blockHash}
        </p>
        <div className="extrinsics">
          <span>Extrinsics</span>
          <h4>{currentBlock?.extrinsics.length}</h4>
        </div>
      </div>
      {
        viewing &&
          <NavigationGroup>
            <Button type="primary" className="back" onClick={backward}>Back to Block</Button>
            <Button type="primary" className="forward" onClick={forward}>Go to Block</Button>
          </NavigationGroup>
      }
    </BlockInfoWrapper>
  );
};

export const Explorer: FC = (): ReactElement => {
  const { retrive: retriveBlocks, blocks: source } = useContext(BlocksContext);
  const [ viewingBlock, setViewingBlock ] = useState<string>('');
  const [ showJumpModal, setShowJumpModal ] = useState<boolean>(false);
  const [ direction, setDirection ] = useState<'backward' | 'forward'>('forward');
  const [ backHeight, setBackHeight ] = useState<number>(-1);
  
  const blocks = useMemo(() => ([...source].reverse()), [source]);

  useEffect(() => {
    retriveBlocks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              setShowJumpModal(true);
            }}
          >Back to Block</Button>
          <Button
            className="forward"
            type="primary"
            onClick={() =>{
              setDirection('forward');
              setShowJumpModal(true);
            }}
          >Go to Block</Button>
        </NavigationGroup>
      </NavigationHighlight>
      {
        blocks.map(block =>
          <BlockWrapper
            id={block.blockHash}
            key={block.blockHash}
          >
            <BlockInfo
              currentBlock={block}
              viewing={viewingBlock === block.blockHash}
              backward={() => {
                setDirection('backward');
                setShowJumpModal(true);
              }}
              forward={() => {
                setDirection('forward');
                setShowJumpModal(true);
              }}
              onBack={setBackHeight}
            />
            <SpaceFill viewing={viewingBlock === block.blockHash} />
            <Table
              showHeader={false}
              rowKey={record => record.hash.toString()}
              locale={{emptyText: 'No Data'}}
              pagination={false}
              dataSource={block ? block.extrinsics : []}
              columns={[
                {
                  width: '30%',
                  key: 'hash',
                  render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{record.method.section}.{record.method.method}</Link>,
                },
                {
                  width: '35%',
                  key: 'transfer',
                  render: (_, record) => <Transfer record={record} />
                },
                {
                  align: 'right',
                  width: '15%',
                  key: 'events',
                  render: (_, record) =>
                    <Events>
                      <img src={EventsSVG} alt=""/>
                      <Link to={`/extrinsic/${record.hash.toString()}/events`}>Events</Link>
                    </Events>
                },
              ]}
            />
            {
              block && block.extrinsics.length > 10 &&
                <ShowMore>
                  <img src={MoveSVG} alt="" />
                  <span>Show All (Total {block ? block.extrinsics.length : 0})</span>
                </ShowMore>
            }
          </BlockWrapper>
        )
      }
      {
        showJumpModal &&
          <JumpToBlock direction={direction} onClose={() => setShowJumpModal(false)} />
      }
      {
        backHeight >=0 &&
          <ConfirmBack height={backHeight} onClose={() => setBackHeight(-1)} />
      }
    </Wrapper>
  );
};
