import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import { UploadContract } from './Upload';
import { store, BlocksContext, ApiContext, useContracts, DeployedContract, DeployedCode } from '../../core';
import { formatAddress, Style } from '../../shared';
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
            render: (_, record) => <Link to={`/block/${record.block.height}`}>{record.block.height}</Link>,
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
            render: (_, record) => <Link to={`/block/${record.block.height}`}>{record.block.height}</Link>,
          },
        ]}
      />
      {
        showUpload &&
          <UploadContract onCancel={() => toggleUpload(false)} onCompleted={() => toggleUpload(false)} />
      }
    </div>
  );
};

export enum ActiveTab {
  Codes = 'codes',
  Instances = 'instances',
}

const TabArea = styled.div`
  height: 48px;
  padding-top: 8px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  color: white;
`;
const Tabs = styled.div`
  padding: 0px 68px;
  display: flex;
  
  >.active {
    background-color: white;
  }

  .active a {
    color: ${Style.color.primary};
  }
`;

const Tab = styled.div`
  width: 133px;
  text-align: center;
  line-height: 40px;
  font-size: 16px;
  

  a {
    color: white; 
  }
`;

const tabs = [
  {
    tab: ActiveTab.Codes,
    title: 'Codes',
    link: `/contract/${ActiveTab.Codes}`,
  },
  {
    tab: ActiveTab.Instances,
    title: 'Instances',
    link: `/contract/${ActiveTab.Instances}`,
  },
];

export const ContractsPage: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts, codesHash } = useContracts(api, blocks);
  const { part } = useParams<{ part: string }>();

  useEffect(() => store.loadAll(), []);

  return (
    <Wrapper>
      <TabArea>
        <Tabs>
          {
            tabs.map(tab =>
              <Tab key={tab.tab} className={ tab.tab === part ? 'active' : ''}>
                <Link to={tab.link}>
                  {tab.title}
                </Link>
              </Tab>
            )
          }
        </Tabs>
      </TabArea>
      
      <Switch>
        <Route path={tabs[0].link}>
          <Codes codes={codesHash} />
        </Route>
        <Route path={tabs[1].link}>
          <Contracts contracts={contracts} />
        </Route>
      </Switch>
    </Wrapper>
  );
};
