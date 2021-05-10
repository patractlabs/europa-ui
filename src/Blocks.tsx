import { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ApiContext } from './api-context';
import { mergeMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import EnterSVG from './assets/imgs/enter.svg';
import MoveSVG from './assets/imgs/more.svg';
import { Table } from 'antd';
import { formatAddress } from './util';
import type { Compact, Vec, GenericExtrinsic } from '@polkadot/types';
import type { CodecHash, BlockNumber } from '@polkadot/types/interfaces';
import type { EventRecord } from '@polkadot/types/interfaces/system';


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

type Extrinsic = GenericExtrinsic & {
  events: Vec<EventRecord>
}
interface Block {
  hash: CodecHash;
  number?: Compact<BlockNumber>;
  extrinsics: Extrinsic[];
};

const BlockInfo: FC<{currentBlock?: Block}> = ({ currentBlock }): ReactElement => {
  return (
    <BlockInfoWrapper>
      <Left>
        <img src={EnterSVG} alt=""/>
        <BlockName>
          <span>Block</span>
          <h4>{currentBlock?.number?.toHuman()}</h4>
        </BlockName>
      </Left>
      <p>
        {currentBlock?.hash.toHuman()}
      </p>
      <Extrinsics>
        <span>Extrinsics</span>
        <h4>{currentBlock?.extrinsics.length}</h4>
      </Extrinsics>
    </BlockInfoWrapper>
  );
};

export const Blocks: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  // const [ currentBlock, setCurrentBlock ] = useState<Block>();
  const [ latestBlocks, setLatestBlocks ] = useState<Block[]>([]);
  const [ currentBlockNumber, setCurrentBlockNumber ] = useState<number>(0);
  const [ atTop,  setAtTop ] = useState<boolean>(true);
  const [ viewingBlock, setViewingBlock ] = useState<string>('');

  useEffect(() => {
    setAtTop(window.scrollY < 146);
    const toggleNavigation = () => {
      setAtTop(window.scrollY < 146);
      const _viewingBlock =  latestBlocks.find(block => {
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
  }, [latestBlocks]);

  useEffect(() => {
    const sub = api.derive.chain.subscribeNewHeads().subscribe(
      block => setCurrentBlockNumber(block.number.toNumber()),
      () => console.log('newhead nothing got'),
    );

    return () => sub.unsubscribe();
  }, [api]);
  
  const forward = useCallback(() => {
    const sub = (api as any).rpc.europa.forwardToHeight(currentBlockNumber + 1).subscribe(
      () => setCurrentBlockNumber(currentBlockNumber + 1),
      () => console.log('bad forward'),
    );

    return () => sub.unsubscribe();
  }, [api, currentBlockNumber]);

  const backward = useCallback(() => {
    const sub = (api as any).rpc.europa.backwardToHeight(currentBlockNumber - 1).subscribe(
      () => setCurrentBlockNumber(currentBlockNumber - 1),
      () => console.log('bad backward'),
    );

    return () => sub.unsubscribe();
  }, [api, currentBlockNumber]);

  useEffect(() => {
    const sub = api.rpc.chain.getBlockHash(currentBlockNumber)
      .pipe(
        mergeMap(hash =>
          combineLatest([
            api.derive.chain.getHeader(hash),
            api.query.system.events.at(hash),
            api.rpc.chain.getBlock(hash),
          ])
        )
      )
      .subscribe(
        ([blockBase, events, block]) => {
          const extrinsics: Extrinsic[] = block.block.extrinsics.map((extrinsic: any, index) => {
            extrinsic.events = events.filter(({ phase }) =>
              phase.isApplyExtrinsic &&
                phase.asApplyExtrinsic.eq(index)
            )
            return extrinsic;
          });

          const current: Block = {
            hash: block.hash,
            number: blockBase?.number,
            extrinsics,
          };

          // setCurrentBlock(current);
          console.log('events', events, 'blocks', block);
          console.log('extrinsics',  extrinsics, extrinsics.map(e => e.toHuman()));
           
          if (!latestBlocks.find(block => block.hash.toString() === current.hash.toString())) {
            setLatestBlocks([
              current,
              ...latestBlocks,
            ]);
          }
          console.log('latest blocks', [
            ...latestBlocks,
            current,
          ]);
        },
        () => console.log('nothing got'),
      );

    return () => sub.unsubscribe();
  }, [currentBlockNumber, api, latestBlocks]);

  return (
    <Wrapper>
      <NavigationHighlight>
        <Navigation>
          <ForwardButton onClick={forward}>Go to Block</ForwardButton>
          <BackButton onClick={backward}>Back to Block</BackButton>
        </Navigation>
      </NavigationHighlight>
      {
        latestBlocks.map(block =>
          <BlockHolder key={block.hash.toString()}>
            <BlockInfoHolder
              id={block.hash.toString()}
              style={{ position: 'sticky', display: viewingBlock === block.hash.toString() ? 'flex': 'block', boxShadow: viewingBlock === block.hash.toString() ? '0px 4px 12px 0px rgba(0, 0, 0, 0.08)' : '', zIndex: viewingBlock === block.hash.toString() ? 10 :  1 }}
            >
              <BlockInfo currentBlock={block} />
              {
                viewingBlock === block.hash.toString() &&
                  <Navigation>
                    <ForwardButton onClick={forward}>Go to Block</ForwardButton>
                    <BackButton onClick={backward}>Back to Block</BackButton>
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
