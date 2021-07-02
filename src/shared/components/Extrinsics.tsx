import React, { CSSProperties, FC, ReactElement, useContext, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationContext, Extrinsic } from '../../core';
import { PageLine, formatAddress, lookForTranferedValue, Transfer } from '../../shared';
import { Style } from '../styled';

const Wrapper = styled.div<{ tdHighlight?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  > .extrinsic-list {
    flex: 1;
    background-color: white;
    
    > .header-fill {
      position: absolute;
      width: 100%;
      height: 55px;
      background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
    }
    .ant-table {
      background: ${props => props.tdHighlight ? 'rgba(0,0,0,0)' : 'white'};
    }
    .ant-table-thead > tr > th {
      background: ${props => props.tdHighlight ? 'rgba(0,0,0,0)' : 'white'};
      color: ${props => props.tdHighlight ? 'white' : Style.color.label.default };
      width: 98px;
      font-weight: 600;
    }
    .ant-table-tbody > tr > td {
      padding: 14px 20px;
    }
    .ant-table-thead > tr > th {
      padding: ${props => props.tdHighlight ? '22px 20px 10px 20px' : '11px 20px' };
    }
  }
`;

export type ExtendedExtrinsic = Extrinsic & {
  height: number;
};

export const Extrinsics: FC<{
  extrinsics: ExtendedExtrinsic[];
  tdHighlight?: boolean;
  showPagination?: boolean;
  paginationStyle?: CSSProperties;
}> = ({ showPagination = true, extrinsics: extrinsicsSource, tdHighlight = false, paginationStyle = {} }): ReactElement => {
  const { pageIndex, pageSize, setTotal } = useContext(PaginationContext);

  const extrinsics: ExtendedExtrinsic[] = useMemo(
    () =>
      extrinsicsSource.slice(pageSize * (pageIndex - 1), pageSize * pageIndex),
    [extrinsicsSource, pageSize, pageIndex],
  );

  useEffect(() => setTotal(extrinsicsSource.length), [extrinsicsSource, setTotal]);

  return (
    <Wrapper tdHighlight={tdHighlight}>
      <div className="extrinsic-list">
        {
          tdHighlight &&
            <div className="header-fill"></div>
        }
        <Table
          rowKey={record => record.hash.toString()}
          locale={{emptyText: 'No Data'}}
          pagination={false}
          dataSource={extrinsics}
          columns={[
            {
              title: <span style={{ marginLeft: '4px' }}>Extrinsic Hash</span>,
              width: '20%',
              key: 'hash',
              render: (_, record) => <Link style={{ marginLeft: '4px' }} to={`/extrinsic/${record.hash}/details`}>{formatAddress(record.hash.toString(), 23)}</Link>,
            },
            {
              title: <span>Block Number</span>,
              width: '15%',
              key: 'from',
              render: (_, record) => <Link to={`/explorer/eoa/${record.signer.toString()}`}>{record.height}</Link>,
            },
            {
              title: <div style={{display: 'flex'}}><span style={{ width: '215px' }}>From</span><span>To</span></div>,
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
      </div>
      {
        showPagination &&
          <PageLine style={Object.assign({ paddingTop: '16px' }, paginationStyle)} showWhenSingle={true} />
      }
    </Wrapper>
  );
};
