import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationContext, Extrinsic } from '../../core';
import { PaginationLine, PaginationR, PageSize, formatAddress, lookForDestAddress, lookForTranferedValue } from '../../shared';

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
        className="asdfaaaaaaaaaa"
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={extrinsics}
        columns={[
          {
            title: <span>Hash</span>,
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{formatAddress(record.hash.toString(), 23)}</Link>,
          },
          {
            title: <span>height</span>,
            width: '15%',
            key: 'from',
            render: (_, record) => <Link to={`/explorer/eoa/${record.signer.toString()}`}>{record.height}</Link>,
          },
          {
            title: <span>from</span>,
            width: '15%',
            key: 'from',
            render: (_, record) => <Link to={`/explorer/eoa/${record.signer.toString()}`}>{formatAddress(record.signer?.toString())}</Link>,
          },
          {
            title: <span>to</span>,
            width: '15%',
            key: 'to',
            render: (_, record) => <Link to={`/explorer/eoa/${record.args[0]?.toString() || ''}`}>{formatAddress(lookForDestAddress(record))}</Link>,
          },
          {
            title: <span>Value</span>,
            width: '15%',
            key: 'value',
            render: (_, record) => <Link to={`/event/tx/${record.hash.toString()}`}>{lookForTranferedValue(record)}</Link>,
          },
          {
            title: <span>Txn Fee</span>,
            width: '15%',
            key: 'txn fee',
            render: (_, record) => <Link to={`/event/tx/${record.hash.toString()}`}>{}</Link>,
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
