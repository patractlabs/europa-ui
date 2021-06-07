import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { BlocksContext, PaginationContext } from '../../core';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import { PageLine, Style } from '../../shared';


const Wrapper = styled.div`
    .ant-table-thead > tr > th {
    background: ${Style.color.primary};
    color: white;
    width: 98px;
    font-weight: 600;
  }
`;

export const Blocks: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  const selectedBlocks = useMemo(
    () => blocks.slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [blocks, pageIndex, pageSize]
  )
  

  useEffect(() => setTotal(blocks.length), [blocks, setTotal]);

  return (
    <Wrapper>
      <Table

        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={selectedBlocks}
        columns={[
          {
            title: 'Block Number',
            width: '20%',
            key: 'block-number',
            render: (_, record) => <Link to={`/explorer/${record.blockHash}`}>{record.height}</Link>,
          },
          {
            title: 'Timestamp',
            width: '25%',
            key: 'time',
            render: (_, record) => <span>{record.extrinsics.reduce((a: EventRecord[], b) => a.concat(b.events), []).find(e => e.event.section === 'timestamp' && e.event.method === 'set')?.event.data[0].toString()}</span>
          },
          {
            title: 'Hash',
            width: '35%',
            key: 'hash',
            render: (_, record) => <Link to={`/explorer/${record.blockHash}`}>{record.blockHash}</Link>,
              
          },
          {
            title: 'Extrinsic Counts',
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/explorer/${record.blockHash}`}>{record.extrinsics.length}</Link>,
              
          },
        ]}
      />
    <PageLine style={{  padding: '0px 20px' }} />  
    </Wrapper>
  );
};
