import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useContracts, ApiContext, BlocksContext, PaginationContext } from '../../core';
import { formatAddress, PageLine } from '../../shared';

const Wrapper = styled.div`
  background-color: white;
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

export const Instances: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  const selectedContracts = useMemo(
    () => [...contracts]
      .reverse()
      .filter(contract => contract.codeHash === hash)
      .slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [contracts, hash, pageIndex, pageSize],
  );

  useEffect(
    () => setTotal(
      contracts.filter(contract => contract.codeHash === hash).length
    ),
    [contracts, hash, setTotal]
  );

  return (
    <Wrapper>
      <Table
        rowKey={record => record.address}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={selectedContracts}
        columns={[
          {
            title: <span>Address</span>,
            width: '50%',
            key: 'hash',
            render: (_, record) => <Link to={`/contract/instances/${record.address}`}>{record.address}</Link>,
          },
          {
            title: <span>Deployed Block</span>,
            width: '15%',
            key: 'block',
            render: (_, record) => <Link to={`/block/${record.block.blockHash}`}>{record.block.height}</Link>,
          },
          {
            title: <span>Deployed transaction</span>,
            width: '35%',
            key: 'extrinsic',
            render: (_, record) => <Link to={`/extrinsic/${record.extrinsic.hash.toString()}/details`}>{formatAddress(record.extrinsic.hash.toString(), 23)}</Link>,
          },
        ]}
      />
      <PageLine style={{ marginTop: '16px' }} />
    </Wrapper>
  );
};
