import { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ApiContext } from './core/provider/api-provider';
import EnterSVG from './assets/imgs/enter.svg';
import MoveSVG from './assets/imgs/more.svg';
import { Table } from 'antd';
import { formatAddress } from './util';
import { Block, BlocksContext } from './core/provider/blocks-provider';

const Wrapper = styled.div`
  background-color: rgb(248, 248, 248);
`;
const BlockHolder = styled.div`
  margin-bottom: 0px;
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
    color: #8C8B8C;
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
    color: #8C8B8C;
    line-height: 16px;
  }
  > h4 {
    height: 24px;
    font-size: 24px;
    font-weight: bold;
    color: #2A292B;
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
  background: #2A292B;
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
  color: #B19E83;

  > img {
    margin-right: 4px;
  }
`;
const BlockInfoHolder = styled.div`
  background: white;
  z-index: 1;
  top: 0px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
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
          <h4>{currentBlock?.height}</h4>
        </BlockName>
      </Left>
      <p>
        {currentBlock?.hash}
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
  const { blocks } = useContext(BlocksContext);
  const [ viewingBlock, setViewingBlock ] = useState<string>('');

  useEffect(() => {
    const toggleNavigation = () => {
      const _viewingBlock =  blocks.find(block => {
        const bounding = document.getElementById(block.hash.toString())?.getBoundingClientRect();
        if (!bounding) {
          return false;
        }
        return bounding.top <=0 && bounding.top > -1 * bounding.height;
      }
      )?.hash.toString();

      setViewingBlock(_viewingBlock || '');
    };
    document.addEventListener('scroll', toggleNavigation, false);
    
    return () => document.removeEventListener('scroll', toggleNavigation);
  }, [blocks]);

  const forward = useCallback((targetBlockHeight: number) => {
    const sub = (api as any).rpc.europa.forwardToHeight(targetBlockHeight).subscribe(
      () => console.log('forward to:', targetBlockHeight),
      () => console.log('bad forward'),
    );

    return () => sub.unsubscribe();
  }, [api]);

  const backward = useCallback((targetBlockHeight: number) => {
    const sub = (api as any).rpc.europa.backwardToHeight(targetBlockHeight).subscribe(
      () => console.log('backed to:', targetBlockHeight),
      () => console.log('bad backward'),
    );

    return () => sub.unsubscribe();
  }, [api]);

  return (
    <Wrapper>
      <NavigationHighlight>
        <Navigation>
          <ForwardButton onClick={() => backward(30)}>Back to Block</ForwardButton>
          <BackButton onClick={() => forward(30)}>Go to Block</BackButton>
        </Navigation>
      </NavigationHighlight>
      {
        blocks.map(block =>
          <BlockHolder key={block.hash.toString()}>
            <BlockInfoHolder
              id={block.hash.toString()}
              style={{ position: 'sticky', display: viewingBlock === block.hash.toString() ? 'flex': 'block', boxShadow: viewingBlock === block.hash.toString() ? '0px 4px 12px 0px rgba(0, 0, 0, 0.08)' : '', zIndex: viewingBlock === block.hash.toString() ? 10 :  1 }}
            >
              <BlockInfo currentBlock={block} />
              {
                viewingBlock === block.hash.toString() &&
                  <Navigation>
                    <ForwardButton onClick={() => backward(30)}>Back to Block</ForwardButton>
                    <BackButton onClick={() => forward(30)}>Go to Block</BackButton>
                  </Navigation>
              }
            </BlockInfoHolder>
            <Table
              rowKey={record => record.hash.toString()}
              locale={{emptyText: 'No Data'}}
              pagination={false}
              dataSource={block ? block.extrinsics : []}
              columns={[
                {
                  title: <span>Hash</span>,
                  dataIndex: 'hash',
                  key: 'hash',
                  render: (_, record) => <span>{record.hash?.toString()}</span>,
                },
                {
                  title: <span>from</span>,
                  dataIndex: 'from',
                  key: 'from',
                  render: (_, record) => <span>{formatAddress(record.signer?.hash.toString())}</span>,
                },
                {
                  title: <span>to</span>,
                  dataIndex: 'to',
                  key: 'to',
                  render: (_, record) => <span>{formatAddress(record.method.method === 'transferKeepAlive' ? record.args[0]?.toString() : '-')}</span>,
                },
                {
                  title: <span>Events</span>,
                  dataIndex: 'events',
                  key: 'events',
                  render: (_, record) => <span>{record.events?.length}</span>,
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
