import React, { FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useContracts, ApiContext, BlocksContext, PaginationContext } from '../../core';
import { PageLine } from '../../shared';

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
    () => contracts
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
            render: (_, record) => <Link to={`/explorer/contract/${record.address}`}>{record.address}</Link>,
          },
          {
            title: <span>Deployed transaction</span>,
            width: '50%',
            key: 'extrinsic',
            render: (_, record) => <Link to={`/extrinsic/${record.extrinsic.hash.toString()}/details`}>{record.extrinsic.hash.toString()}</Link>,
          },
        ]}
      />
      <PageLine style={{ marginTop: '16px' }} />
    </Wrapper>
  );
};
