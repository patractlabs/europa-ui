import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, Route, Switch } from 'react-router-dom';
import { DeployModal } from './DeployModal';
import { store, BlocksContext, ApiContext, useContracts, DeployedContract, DeployedCode, useRedspotContracts, SettingContext, RedspotContract } from '../../core';
import { formatAddress, PageTabs, Style } from '../../shared';
import { Table } from 'antd';
import type { Abi } from '@polkadot/api-contract';
import { UploadAbi } from '../code-hash/UploadAbi';

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
        <label>Deployed Contract Instances</label>
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
            render: (_, record) => <span>{formatContractName(record.codeHash, redspotsContracts)}</span>,
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

function getAbi(hash: string, redspotsContracts: RedspotContract[]): Abi | undefined {
  return store.getCode(hash)?.contractAbi ||
    redspotsContracts.find(code => code.codeHash === hash)?.abi;
}

function formatContractName(codeHash: string, redspotsContracts: RedspotContract[]): string {
  return store.getCode(codeHash)?.json.name ||
    redspotsContracts.find(code => code.codeHash === codeHash)?.name ||
    '<unknown>';
}

const Codes: FC<{ codes: DeployedCode[], redspotsContracts: RedspotContract[] }> = ({ codes, redspotsContracts }): ReactElement => {
  const [ showDeploy, toggleDeploy ] = useState(false);
  const [ showUploadAbi, toggleUploadAbi ] = useState(false);
  const [ choosedContract, setChoosedContract ] = useState<{ abi?: Abi; name: string }>();
  const [ choosedCode, setChoosedCode ] = useState<DeployedCode>();

  return (
    <CodesWrapper>
      <Title>
        <label>Deployed Codes</label>
        <Button onClick={() => toggleDeploy(true)}>Upload & deploy contract</Button>
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
            render: (_, record) => <span>{formatContractName(record.hash, redspotsContracts)}</span>,
          },
          {
            title: <span>Code Hash</span>,
            width: '20%',
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
            width: '20%',
            key: 'block',
            render: (_, record) => <Link to={`/block/${record.block.blockHash}`}>{record.block.height}</Link>,
          },
          {
            title: <span>Operation</span>,
            width: '10%',
            key: 'operation',
            render: (_, record) => <span>{
              !getAbi(record.hash, redspotsContracts) ?
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a onClick={() => {
                  setChoosedCode(record);
                  toggleUploadAbi(true);
                }}>upload ABI</a> :
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a onClick={() => {
                  setChoosedContract({
                    abi: getAbi(record.hash, redspotsContracts),
                    name: formatContractName(record.hash, redspotsContracts),
                  });
                  toggleDeploy(true);
                }}>deploy</a>
            }</span>,
          },
        ]}
      />
      {
        showDeploy &&
          <DeployModal
            abi={choosedContract?.abi}
            contractName={choosedContract?.name}
            onCancel={() => {
              toggleDeploy(false);
            }}
            onCompleted={() => {
              toggleDeploy(false);
            }}
          />
      }
      {
        showUploadAbi &&
          <UploadAbi
            onCanceled={() => {
              toggleUploadAbi(false);
            }}
            onCompleted={() => {
              toggleUploadAbi(false);
            }}
            codeHash={choosedCode?.hash || ''} blockHeight={choosedCode?.block.height || 0} 
          />
      }

      <Title style={{ marginTop: '20px' }}>
        <label>Redspot Codes</label>
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
            width: '20%',
            dataIndex: 'codeHash',
            key: 'codeHash',
            render: (codeHash) => <Link to={`/explorer/code-hash/${codeHash}`}>{formatAddress(codeHash)}</Link>,
          },
          {
            title: <span>Disk Path</span>,
            width: '50%',
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
                  setChoosedContract({
                    abi: record.abi,
                    name: record.name,
                  });
                  toggleDeploy(true);
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
  const { setting } = useContext(SettingContext);
  const { redspotContracts } = useRedspotContracts(
    setting.redspots || []
  );

  useEffect(() => store.loadAll(), []);

  return (
    <Wrapper>
      <TabArea>
        <PageTabs options={tabs} />
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
