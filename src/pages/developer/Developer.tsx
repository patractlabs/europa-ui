import React, { FC, ReactElement } from 'react';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Style } from '../../shared';
import { ChainState } from './ChainState';
import { Extrinsic } from './Extrinsics';
import { Log } from './Log';
import { RpcCall } from './RpcCall';

const Wrapper = styled.div`
`;
const Content = styled.div`
  padding: 20px;
`;
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
  const { part } = useParams<{ part: string }>();

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
