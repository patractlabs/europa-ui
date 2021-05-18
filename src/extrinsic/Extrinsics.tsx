import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BlocksContext, Extrinsic } from '../core/provider/blocks.provider';
import { PaginationContext, PaginationProvider } from '../core/provider/pagination.provider';
import { PageSize } from '../shared/components/PageSize';
import { PaginationR } from '../shared/components/Pagination';
import { formatAddress, lookForDestAddress, lookForTranferedValue } from '../shared/util';
import { Route, Switch } from 'react-router-dom';
import { ExtrinsicDetail } from './ExtrinsicDetail';

const Wrapper = styled.div`
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type ExtendedExtrinsic = Extrinsic & {
  height: number;
};

const ExtrinsicsR: FC = (): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { pageIndex, pageSize } = useContext(PaginationContext);

  const seletecExtrinsics: ExtendedExtrinsic[] = useMemo(
    () => [...blocks].reverse().reduce((all: ExtendedExtrinsic[], block) => {
      const extrinsics = block.extrinsics.map(extrinsic => Object.assign(extrinsic, {
        height: block.height,
      }));
      return all.concat(extrinsics);
    }, []).slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [blocks, pageSize, pageIndex],
  );

  useMemo(() => {
    console.log('seletecExtrinsics[0]', seletecExtrinsics[0]?.tip.toString());
  }, [seletecExtrinsics]);

  return (
    <Wrapper>
      <Table
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={seletecExtrinsics}
        columns={[
          {
            title: <span>Hash</span>,
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/extrinsic/${record.hash}`}>{formatAddress(record.hash.toString(), 23)}</Link>,
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
            render: (_, record) => <Link to={`/explorer/eoa/${record.args[0]?.toString() || ''}`}>{lookForDestAddress(record)}</Link>,
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
      <Footer>
        <PageSize />
        <PaginationR />
      </Footer>
    </Wrapper>
  );
};

export const Extrinsics: FC = (): ReactElement => {
  return (
    <Switch>
      <Route path='/extrinsic/detail/:part'>
        <PaginationProvider>
          <ExtrinsicDetail />
        </PaginationProvider>
      </Route>
      <Route path='/extrinsic' exact>
        <PaginationProvider>
          <ExtrinsicsR />
        </PaginationProvider>
      </Route>
    </Switch>
  );
}
