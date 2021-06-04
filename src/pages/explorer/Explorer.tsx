import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import EnterSVG from '../../assets/imgs/enter.svg';
import MoveSVG from '../../assets/imgs/more.svg';
import EventsSVG from '../../assets/imgs/events.svg';
import { Table } from 'antd';
import { ApiContext, Block, BlocksContext } from '../../core';
import { Link } from "react-router-dom";
import { Style } from '../../shared/styled/const';
import { Transfer } from '../../shared';

const Wrapper = styled.div`
  background-color: rgb(248, 248, 248);

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
  }
`;
const BlockHolder = styled.div`
  margin-bottom: 0px;

  .ant-table-thead > tr > th {
    background: linear-gradient(90deg, #BEAC92 0%, ${Style.color.primary} 100%);
  }
`;
const BlockInfoWrapper = styled.div`
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;

  > p {
    padding: 0px 40px;
  }
`;
const Left = styled.div`
  display: flex;

  > img {
    margin-right: 20px;
  }
`;

const BlockName = styled.div`

  > span {
    font-size: 14px;
    color: ${Style.color.label.default};
    line-height: 16px;
  }
  > h4 {
    height: 24px;
    font-size: 24px;
    font-weight: bold;
    color: #DBAA66;
    line-height: 24px;
  }
`;

const Extrinsics = styled.div`
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
`;
const Navigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const NavigationButton = styled.button`
  width: 150px;
  height: 51px;
  border-radius: 26px;
  border-width: 0px;
  color: white;
  cursor: pointer;
  outline: none;
  font-size: 15px;
  line-height: 18px;
`;
const BackButton = styled(NavigationButton)`
  background: ${Style.color.label.primary};
`;
const ForwardButton = styled(NavigationButton)`
  margin-right: 9px;
  background: #BEAC92;
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
const BlockInfoHolder = styled.div`
  width: 100%;
  background: white;
  z-index: 1;
  top: 0px;
  padding: 14px 18px;
  justify-content: space-between;
`;

const SpaceFill = styled.div`
  height: 78px;
`;

const Events = styled.div`
  display: flex;
  align-items: center;

  > img {
    margin-right: 10px;
    width: 20px;
    height: 20px;
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

const BlockInfo: FC<{currentBlock?: Block}> = ({ currentBlock }): ReactElement => {
  return (
    <BlockInfoWrapper>
      <Left>
        <img src={EnterSVG} alt=""/>
        <BlockName>
          <span>Block</span>
          <h4>
            <Link to={`/explorer/block/${currentBlock?.blockHash}`}>{currentBlock?.height}</Link>
          </h4>
        </BlockName>
      </Left>
      <p>
        {currentBlock?.blockHash}
      </p>
      <Extrinsics>
        <span>Extrinsics</span>
        <h4>{currentBlock?.extrinsics.length}</h4>
      </Extrinsics>
    </BlockInfoWrapper>
  );
};

export const Explorer: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks: source, backward } = useContext(BlocksContext);
  const [ viewingBlock, setViewingBlock ] = useState<string>('');
  const blocks = useMemo(() => ([...source].reverse()), [source]);

  const forward = useCallback((targetBlockHeight: number) => {
    const sub = (api as any).rpc.europa.forwardToHeight(targetBlockHeight).subscribe(
      () => console.log('forward to:', targetBlockHeight),
      () => console.log('bad forward'),
    );

    return () => sub.unsubscribe();
  }, [api]);

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
        <Navigation>
          <ForwardButton onClick={() => backward(0)}>Back to Block</ForwardButton>
          <BackButton onClick={() => forward(30)}>Go to Block</BackButton>
        </Navigation>
      </NavigationHighlight>
      {
        blocks.map(block =>
          <BlockHolder
            id={block.blockHash}
            key={block.blockHash}
          >
            <BlockInfoHolder className={viewingBlock === block.blockHash ? 'viewing-block' : 'not-viewing-block'}>
              <BlockInfo currentBlock={block} />
              {
                viewingBlock === block.blockHash &&
                  <Navigation>
                    <ForwardButton onClick={() => backward(1)}>Back to Block</ForwardButton>
                    <BackButton onClick={() => forward(30)}>Go to Block</BackButton>
                  </Navigation>
              }
            </BlockInfoHolder>
            <SpaceFill style={{ display: viewingBlock === block.blockHash ? 'block': 'none' }}/>
            <Table
              showHeader={false}
              rowKey={record => record.hash.toString()}
              locale={{emptyText: 'No Data'}}
              pagination={false}
              dataSource={block ? block.extrinsics : []}
              columns={[
                {
                  width: '50%',
                  key: 'hash',
                  render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{record.method.section}.{record.method.method}</Link>,
                },
                {
                  width: '35%',
                  key: 'transfer',
                  render: (_, record) => <Transfer record={record} />
                },
                {
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
          </BlockHolder>
        )
      }
    </Wrapper>
  );
};
