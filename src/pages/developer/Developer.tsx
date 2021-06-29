import React, { FC, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { PageTabs, Style } from '../../shared';
import { ChainState } from './ChainState';
import { Extrinsic } from './Extrinsics';
import { Log } from './Log';
import { RpcCall } from './RpcCall';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const Content = styled.div`
  padding: 20px;
  flex: 1;
`;
const TabArea = styled.div`
  height: 48px;
  padding-top: 8px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  color: white;
`;

export enum ActiveTab {
  ChainState = 'chainState',
  Extrinsic = 'extrinsic',
  RpcCall = 'rpcCall',
  Log = 'log',
}

const tabs = [
  {
    tab: ActiveTab.ChainState,
    title: 'ChainState',
    link: `/developer/${ActiveTab.ChainState}`,
  },
  {
    tab: ActiveTab.Extrinsic,
    title: 'Extrinsic',
    link: `/developer/${ActiveTab.Extrinsic}`,
  },
  {
    tab: ActiveTab.RpcCall,
    title: 'RpcCall',
    link: `/developer/${ActiveTab.RpcCall}`,
  },
  {
    tab: ActiveTab.Log,
    title: 'Log',
    link: `/developer/${ActiveTab.Log}`,
  }
];

export const Developer: FC = (): ReactElement => {

  return (
    <Wrapper>
      <TabArea>
        <PageTabs options={tabs} />
      </TabArea>

      <Content>
        <Switch>
          <Route path={tabs[0].link}>
            <ChainState/>
          </Route>
          <Route path={tabs[1].link}>
            <Extrinsic />
          </Route>
          <Route path={tabs[2].link}>
            <RpcCall />
          </Route>
          <Route path={tabs[3].link}>
            <Log />
          </Route>
        </Switch>
      </Content>
    </Wrapper>
  );
};
