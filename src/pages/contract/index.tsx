import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { UploadContract } from './Upload';
import { store, BlocksContext, ApiContext, useContracts, DeployedContract, DeployedCode } from '../../core';
import { formatAddress, Style, Tabs } from '../../shared';
import { Table } from 'antd';

const Wrapper = styled.div`
  .ant-table-thead > tr > th {
    color: ${Style.color.label.default};
    background-color: white;
  }
`;
const Title = styled.h2`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  > label {
    font-size: 24px;
    color: ${Style.color.label.primary};
    font-weight: bold;
  }
`;
const Button = styled.button`
  background-color: ${Style.color.bg.default};
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  border: 1px solid ${Style.color.button.primary};
  border-radius: 27px;
  font-weight: 600;
  font-size: 14px;
  padding: 0px 24px;
  color: ${Style.color.primary};
`;
const TabTitle = styled.div`
  padding-left: 80px;
  background: ${Style.color.primary};
  display: flex;
`;

const Contracts: FC<{ contracts: DeployedContract[] }> = ({ contracts }): ReactElement => {

  return (
    <div>
      <Title>
        <label>All Contracts</label>
      </Title>
      <Table
        rowKey={record => record.address}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={contracts}
        columns={[
          {
            title: <span>Name</span>,
            width: '20%',
            key: 'name',
            render: (_, record) => <span>{store.getCode(record.codeHash)?.json.name}</span>,
          },
          {
            title: <span>Address</span>,
            width: '35%',
            key: 'hash',
            render: (_, record) => <Link to={`/explorer/contract/${record.address}`}>{formatAddress(record.address)}</Link>,
          },
          {
            title: <span>Deployed Extrinsic</span>,
            width: '35%',
            key: 'extrinsic',
            render: (_, record) => <Link to={`/extrinsic/${record.extrinsic.hash.toString()}/details`}>{formatAddress(record.extrinsic.hash.toString())}</Link>,
          },
          {
            title: <span>Deployed Block</span>,
            width: '10%',
            key: 'block',
            render: (_, record) => <Link to={`/explorer/block/${record.block.height}`}>{record.block.height}</Link>,
          },
        ]}
      />
    </div>
  );
};


const Codes: FC<{ codes: DeployedCode[] }> = ({ codes }): ReactElement => {
  const [ showUpload, toggleUpload ] = useState(false);

  return (
    <div>      
      <Title>
        <label>All Code Hashes</label>
        <Button onClick={() => toggleUpload(true)}>Upload & deploy contract</Button>
      </Title>
      <Table
        rowKey={record => record.hash}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={codes}
        columns={[
          {
            title: <span>Name</span>,
            width: '20%',
            key: 'name',
            render: (_, record) => <span>{store.getCode(record.hash)?.json.name}</span>,
          },
          {
            title: <span>Code Hash</span>,
            width: '35%',
            key: 'hash',
            render: (_, record) => <Link to={`/explorer/code-hash/${record.hash}`}>{formatAddress(record.hash)}</Link>,
          },
          {
            title: <span>Uploaded At Extrinsic</span>,
            width: '35%',
            key: 'extrinsic',
            render: (_, record) => <Link to={`/extrinsic/${record.extrinsic.hash.toString()}/details`}>{formatAddress(record.extrinsic.hash.toString())}</Link>,
          },
          {
            title: <span>Uploaded At Block</span>,
            width: '10%',
            key: 'block',
            render: (_, record) => <Link to={`/explorer/block/${record.block.height}`}>{record.block.height}</Link>,
          },
        ]}
      />
      <UploadContract onCancel={() => toggleUpload(false)} onCompleted={() => toggleUpload(false)} show={showUpload} />
    </div>
  );
};
enum TabChoice {
  Codes = 'Codes',
  Contracts = 'Contracts',
}

export const ContractsPage: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts, codesHash } = useContracts(api, blocks);
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Codes);

  useEffect(() => store.loadAll(), []);

  return (
    <Wrapper>
      <TabTitle>
        <Tabs
          options={[
            { name: 'Codes', value: TabChoice.Codes },
            { name: 'Instances', value: TabChoice.Contracts },
          ]}
          defaultValue={TabChoice.Codes}
          onChange={choice => setTabChoice(choice)}
        ></Tabs>
      </TabTitle>
      {
        tabChoice === TabChoice.Codes &&
          <Codes codes={codesHash} />
      }
      {
        tabChoice === TabChoice.Contracts &&
          <Contracts contracts={contracts} />
      }
    </Wrapper>
  );
};
