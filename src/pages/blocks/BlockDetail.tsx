import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import { useParams } from 'react-router-dom';
import { ApiContext, Block, BlocksContext, PaginationProvider } from '../../core';
import { Events, Extrinsics, Style, Tabs } from '../../shared';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import States from './States';

const Wrapper = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;

  .info-table .ant-table-tbody > tr > td {
    padding: 12px 20px;
    height: 42px;
    color: ${Style.color.label.primary};
    border-color: ${Style.color.border.default};
  }
  .info-table {
    margin-bottom: 30px;
  }
`;
const Key = styled.span`
  font-weight: 500;
`;

interface Info {
  key: string;
  value: string;
}

enum TabChoice {
  Extrinsics = 'Extrinsics',
  Events = 'Events',
  States = 'States',
}

const BlockTabs: FC<{ block: Block }> = ({ block }): ReactElement => {
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Extrinsics);
  const extrinsics = block.extrinsics.map(extrinsic => Object.assign(extrinsic, {
    height: block.height,
  }));
  const events = extrinsics.reduce((events: EventRecord[], extrinsic) => events.concat(extrinsic.events), []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Tabs
        options={[
          { name: 'Extrinsics', value: TabChoice.Extrinsics },
          { name: 'Events', value: TabChoice.Events },
          { name: 'States', value: TabChoice.States },
        ]}
        defaultValue={TabChoice.Extrinsics}
        onChange={choice => setTabChoice(choice)}
      ></Tabs>
  
      {
        tabChoice === TabChoice.Extrinsics &&
          <PaginationProvider>
            <Extrinsics showPagination={false} extrinsics={extrinsics} />
          </PaginationProvider>
      }
  
      {
        tabChoice === TabChoice.Events &&
          <PaginationProvider defaultPageSize={8}>
            <Events events={events} />
          </PaginationProvider>
      }
  
      {
        tabChoice === TabChoice.States &&
          <States block={block} />
      }
    </div>

  );
};

export const BlockDetail: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { api } = useContext(ApiContext);
  const { blockHash } = useParams<{ blockHash: string }>();
  const [ infos, setInfos ] = useState<Info[]>([]);

  const block = useMemo(() => blocks.find(_block => _block.blockHash === blockHash), [blocks, blockHash]);

  useEffect(() => {
    const setTimeExtrinsic = block?.extrinsics.find(extrinsic =>
      extrinsic.method.section.toString() === 'timestamp' && extrinsic.method.method.toString() === 'set'
    );
    const timestamp = setTimeExtrinsic?.args[0].toString();
    
    api.rpc.chain.getHeader(blockHash).subscribe(header => {
      setInfos([
        {
          key: 'TimeStamp',
          value: timestamp || '',
        },
        {
          key: 'Hash',
          value: blockHash
        },
        {
          key: 'Parent Hash',
          value: header.parentHash.toString(),
        },
        {
          key: 'State Root',
          value: header.stateRoot.toString(),
        },
        {
          key: 'Extrinsics Root',
          value: header.extrinsicsRoot.toString(),
        },
      ]);
    });
  }, [blockHash, blocks, api.rpc.chain, block]);

  return (
    <Wrapper>
      <Table
        className="info-table"
        showHeader={false}
        rowKey={record => record.key}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={infos}
        columns={[
          {
            width: '30%',
            key: 'key',
            dataIndex: 'key',
            render: (key) => <Key>{key}</Key>,
          },
          {
            key: 'value',
            dataIndex: 'value',
            render: (value) => <span>{value}</span>
          },
        ]}
      />
      {
        block &&
          <BlockTabs block={block}></BlockTabs>
      }
    </Wrapper>
  );
};
