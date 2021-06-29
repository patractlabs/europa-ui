import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import { UploadContract } from './Upload';
import { store, BlocksContext, ApiContext, useContracts, DeployedContract, DeployedCode, useRedspotContracts, SettingContext, RedspotContract } from '../../core';
import { formatAddress, Style } from '../../shared';
import { Table } from 'antd';
import type { Abi } from '@polkadot/api-contract';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

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
const InstancesWrapper = styled.div`
  flex: 1;
`;
const CodesWrapper = styled.div`
  flex: 1;
`;

const Instances: FC<{ contracts: DeployedContract[], redspotsContracts: RedspotContract[] }> = ({ contracts, redspotsContracts }): ReactElement => {

  return (
    <InstancesWrapper>
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
            render: (_, record) => <span>{store.getCode(record.codeHash)?.json.name || redspotsContracts.find(code => code.codeHash === record.codeHash)?.name}</span>,
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
            render: (_, record) => <Link to={`/block/${record.block.blockHash}`}>{record.block.height}</Link>,
          },
        ]}
      />
    </InstancesWrapper>
  );
};

const Codes: FC<{ codes: DeployedCode[], redspotsContracts: RedspotContract[] }> = ({ codes, redspotsContracts }): ReactElement => {
  const [ showUpload, toggleUpload ] = useState(false);
  const [ choosedAbi, setChoosedAbi ] = useState<Abi>();

  return (
    <CodesWrapper>
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
            render: (_, record) => <span>{store.getCode(record.hash)?.json.name || redspotsContracts.find(code => code.codeHash === record.hash)?.name}</span>,
          },
          {
            title: <span>Code Hash</span>,
            width: '30%',
            key: 'hash',
            render: (_, record) => <Link to={`/explorer/code-hash/${record.hash}`}>{formatAddress(record.hash)}</Link>,
          },
          {
            title: <span>Uploaded At Extrinsic</span>,
            width: '30%',
            key: 'extrinsic',
            render: (_, record) => <Link to={`/extrinsic/${record.extrinsic.hash.toString()}/details`}>{formatAddress(record.extrinsic.hash.toString())}</Link>,
          },
          {
            title: <span>Uploaded At Block</span>,
            width: '10%',
            key: 'block',
            render: (_, record) => <Link to={`/block/${record.block.blockHash}`}>{record.block.height}</Link>,
          },
          {
            title: <span>Operation</span>,
            width: '10%',
            key: 'operation',
            render: (_, record) => <span>{
              !store.getCode(record.hash)?.json && !redspotsContracts.find(code => code.codeHash === record.hash) ?
                <span>Deployed</span> :
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a onClick={() => {
                  setChoosedAbi(store.getCode(record.hash)?.contractAbi);
                  toggleUpload(true);
                }}>deploy</a>
            }</span>,
          },
        ]}
      />
      {
        showUpload &&
          <UploadContract abi={choosedAbi} onCancel={() => {
            toggleUpload(false);
            setChoosedAbi(undefined);
          }} onCompleted={() => {
            toggleUpload(false);
            setChoosedAbi(undefined);
          }} />
      }
      <Title style={{ marginTop: '20px' }}>
        <label>Contracts from disk</label>
      </Title>
      <Table
        rowKey={record => record.codeHash}
        locale={{emptyText: 'No Data'}}
        pagination={false}
        dataSource={redspotsContracts}
        columns={[
          {
            title: <span>Name</span>,
            width: '20%',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <span>{name}</span>,
          },
          {
            title: <span>Code Hash</span>,
            width: '35%',
            dataIndex: 'codeHash',
            key: 'codeHash',
            render: (codeHash) => <Link to={`/explorer/code-hash/${codeHash}`}>{formatAddress(codeHash)}</Link>,
          },
          {
            title: <span>Disk Path</span>,
            width: '35%',
            dataIndex: 'path',
            key: 'path',
            render: (path) => <span>{path}</span>,
          },
          {
            title: <span>Operation</span>,
            width: '10%',
            key: 'operation',
            render: (_, record) => <span>{
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a onClick={() => {
                  setChoosedAbi(record.abi);
                  toggleUpload(true);
                }}>deploy</a>
            }</span>,
          },
        ]}
      />
    </CodesWrapper>
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
  const { setting, choosed } = useContext(SettingContext);
  const { redspotContracts } = useRedspotContracts(
    setting.databases
      .find(db => db.path === choosed.database)?.workspaces
      .find(w => w.name === choosed.workspace)?.redspots || []
  );
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
          <Codes codes={codesHash} redspotsContracts={redspotContracts} />
        </Route>
        <Route path={tabs[1].link}>
          <Instances contracts={contracts} redspotsContracts={redspotContracts} />
        </Route>
      </Switch>
    </Wrapper>
  );
};
