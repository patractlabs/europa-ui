import React, { ReactElement, FC, useContext, useMemo, useEffect } from 'react';
import { Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationContext, BlocksContext, Extrinsic, ApiContext, useBalance } from '../../core';
import { Transfer, PageSize, PaginationR, formatAddress, lookForDestAddress, lookForTranferedValue, PaginationLine, Style, contentBase, InfoHeader } from '../../shared';

const Wrapper = styled.div`
  ${contentBase}

  .ant-table-thead > tr > th {
    background-color: white;
  }
`;
const HeaderLabel = styled.span`
  color: ${Style.color.label.default};
`;
const Title = styled.h2`
  padding: 20px;

  > label {
    font-size: 24px;
    color: ${Style.color.label.primary};
    font-weight: bold;
  }
  > span {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 400;
    color: ${Style.color.label.default};
  }
`;

type ExtenedExtrinsic = Extrinsic & {
  blockHash: string;
  height: number;
  from: string;
  to: string;
  fee: string;
};

export const EOA: FC = (): ReactElement => {
  const { address } = useParams<{ address: string }>();
  const { blocks } = useContext(BlocksContext);
  const { api } = useContext(ApiContext);
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);
  const { balance } = useBalance(api, address);

  const extrinsics: ExtenedExtrinsic[] = useMemo(() =>
    [...blocks]
      .reverse()
      .reduce(
        (extrinsics: ExtenedExtrinsic[], block) =>
          extrinsics.concat(
            block.extrinsics.map(extrinsic => Object.assign(extrinsic, {
              blockHash: block.blockHash,
              height: block.height,
              from: extrinsic.signer.toString(),
              to: lookForDestAddress(extrinsic),
              fee: '',
            }))
          ),
          [],
        )
      .filter(extrinsic => extrinsic.from === address || extrinsic.to === address)
    ,
    [blocks, address],
  );

  const selectedExtrinsics = useMemo(
    () => extrinsics.slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [extrinsics, pageIndex, pageSize],
  );

  useEffect(() => setTotal(extrinsics.length), [extrinsics, setTotal]);

  return (
    <Wrapper>
      <InfoHeader pairs={
        [
          {
            label: 'Address',
            render: <span style={{ fontSize: '16px', color: Style.color.label.primary }}>{address}</span>
          },
          {
            label: 'Balance',
            align: 'right',
            render:
              <span style={{ fontSize: '18px', fontWeight: 600, color: Style.color.label.primary }}>{balance?.toString()} DOT</span>
          },
        ]
      }/>
      <Title>
        <label>Extrinsics</label>
      </Title>
      <Table
        style={{ marginBottom: '16px' }}
        rowKey={record => record.hash.toString()}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={selectedExtrinsics}
        columns={[
          {
            title: <HeaderLabel>Hash</HeaderLabel>,
            width: '20%',
            key: 'hash',
            render: (_, record) => <Link to={`/extrinsic/${record.hash}/details`}>{formatAddress(record.hash.toString(), 23)}</Link>,
          },
          {
            title: <HeaderLabel>Block Number</HeaderLabel>,
            width: '15%',
            key: 'from',
            render: (_, record) => <Link to={`/block/${record.blockHash}`}>{record.height}</Link>,
          },
          {
            title: <div style={{display: 'flex', color: Style.color.label.default}}><span style={{ width: '215px' }}>From</span><span>To</span></div>,
            width: '35%',
            key: 'transfer',
            render: (_, record) => <Transfer signer={address} record={record} />
          },
          {
            title: <HeaderLabel>Value</HeaderLabel>,
            width: '15%',
            key: 'value',
            render: (_, record) => <span>{lookForTranferedValue(record)}</span>,
          },
          {
            title: <HeaderLabel>Txn Fee</HeaderLabel>,
            width: '15%',
            key: 'txn fee',
            render: () => <span>-</span>,
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

