import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { ExtendedBlock } from '../../core';
import { Link } from "react-router-dom";
import { Style, Transfer } from '../../shared';
import { Button, Table } from 'antd';
import EnterSVG from '../../assets/imgs/return.svg';
import MoveSVG from '../../assets/imgs/more.svg';
import EventsSVG from '../../assets/imgs/events.svg';
import { NavigationGroup } from './Explorer';

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

const BlockWrapper = styled.div<{ viewing: boolean; expanded: boolean }>`
  margin-bottom: 0px;
  padding-bottom: 20px;

  .ant-table-thead > tr > th {
    background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  }

  > .space-fill {
    display: ${props => props.viewing ? 'block': 'none'};
    height: 78px;
  }
  > .show-more {
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
      transform: ${props => props.expanded ? 'scaleY(-1)' : ''};
    }
  }
`;

const CurrentBlock: FC<{
  currentBlock: ExtendedBlock;
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

const Block: FC<{
  className?: string;
  block: ExtendedBlock;
  viewing: boolean;
  onJump: (direction: 'backward' | 'forward') => void;
  onBack: (height: number) => void;
}> = ({ className, block, viewing, onJump, onBack }): ReactElement => {
  const [ expanded, setExpanded ] = useState<boolean>(false);

  return (
    <BlockWrapper className={className} id={block.blockHash} viewing={viewing} expanded={expanded}>
      <CurrentBlock
        currentBlock={block}
        viewing={viewing}
        backward={() => {
          onJump('backward');
        }}
        forward={() => {
          onJump('forward');
        }}
        onBack={onBack}
      />
      <div className="space-fill" />
      <Table
        showHeader={false}
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={block ? block.extrinsics.slice(0, expanded ? block.extrinsics.length : 10) : []}
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
          <div className="show-more" onClick={() => setExpanded(old => !old)}>
            <img src={MoveSVG} alt=""/>
            <span>{ expanded ? 'Hide' : 'Show All' } (Total {block ? block.extrinsics.length : 0})</span>
          </div>
      }
    </BlockWrapper>
  );
};

export default Block;