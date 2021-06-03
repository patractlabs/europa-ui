import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationContext, Extrinsic } from '../../core';
import { PaginationLine, PaginationR, PageSize, formatAddress, lookForDestAddress, lookForTranferedValue, Transfer } from '../../shared';

const Wrapper = styled.div`
  
  .ant-table-thead > tr > th {
    background-color: white;
  }
`;

export type ExtendedExtrinsic = Extrinsic & {
  height: number;
};

export const Extrinsics: FC<{ extrinsics: ExtendedExtrinsic[] }> = ({ extrinsics: extrinsicsSource }): ReactElement => {
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  const extrinsics: ExtendedExtrinsic[] = useMemo(
    () =>
      extrinsicsSource.slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [extrinsicsSource, pageSize, pageIndex],
  );

  useEffect(() => setTotal(extrinsicsSource.length), [extrinsicsSource, setTotal]);

  return (
    <Wrapper>
      <Table
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={extrinsics}
        columns={[
          {
            title: <span>Extrinsic Hash</span>,
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{formatAddress(record.hash.toString(), 23)}</Link>,
          },
          {
            title: <span>Block Number</span>,
            width: '15%',
            key: 'from',
            render: (_, record) => <Link to={`/explorer/eoa/${record.signer.toString()}`}>{record.height}</Link>,
          },
          {
            title: <div style={{display: 'flex'}}><span style={{ width: '183px' }}>From</span><span>To</span></div>,
            width: '35%',
            key: 'transfer',
            render: (_, record) => <Transfer record={record} />
          },
          {
            title: <span>Value</span>,
            width: '15%',
            key: 'value',
            render: (_, record) => <span>{lookForTranferedValue(record)}</span>,
          },
          {
            title: <span>Txn Fee</span>,
            width: '15%',
            key: 'txn fee',
            render: (_, record) => <span>{}</span>,
          },
        ]}
      />
      <PaginationLine>
        <PageSize />
        <PaginationR />
      </PaginationLine>
    </Wrapper>
  );
};
