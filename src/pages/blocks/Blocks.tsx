import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { BlocksContext, PaginationContext } from '../../core';
import { formatBlockTimestamp, PageLine, Style } from '../../shared';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  > .header-fill {
    position: absolute;
    width: 100%;
    height: 50px;
    background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  }
  .ant-table {
    background: rgba(0,0,0,0);
  }
  .ant-table-thead > tr > th {
    background: rgba(0,0,0,0);
    padding: 20px 14px 8px 20px;
    color: white;
    font-weight: 600;
  }
  .ant-table-tbody > tr > td {
    padding: 14px 20px;
  }
`;

export const Blocks: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  const selectedBlocks = useMemo(
    () => [...blocks]
      .reverse()
      .slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [blocks, pageIndex, pageSize]
  )

  useEffect(() => setTotal(blocks.length), [blocks, setTotal]);

  return (
    <Wrapper>
      <div className="header-fill"></div>
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
            render: (_, record) => <Link to={`/block/${record.blockHash}`}>{record.height}</Link>,
          },
          {
            title: 'Timestamp',
            width: '25%',
            key: 'time',
            render: (_, record) => <span>{formatBlockTimestamp(record)}</span>
          },
          {
            title: 'Hash',
            width: '35%',
            key: 'hash',
            render: (_, record) => <Link to={`/block/${record.blockHash}`}>{record.blockHash}</Link>,
          },
          {
            title: 'Extrinsic Counts',
            width: '20%',
            key: 'hash',
            render: (_, record) => <span>{record.extrinsics.length}</span>,
          },
        ]}
      />

      <PageLine style={{
        padding: '16px 20px 30px 20px'
      }}/>
    </Wrapper>
  );
};
