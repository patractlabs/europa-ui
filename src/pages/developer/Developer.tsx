import React, { FC, ReactElement, useState } from 'react';
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
;
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

enum TabChoice {
  ChainState = 'ChainState',
  Extrinsic = 'Extrinsic',
  RpcCall = 'RpcCall',
  Log = 'Log',
}

const tabs = [
  {
    tab: TabChoice.ChainState,
    title: 'ChainState',
    link: `/developer/${TabChoice.ChainState}`,
  },
  {
    tab: TabChoice.Extrinsic,
    title: 'Extrinsic',
    link: `/developer/${TabChoice.Extrinsic}`,
  },
  {
    tab: TabChoice.RpcCall,
    title: 'RpcCall',
    link: `/developer/${TabChoice.RpcCall}`,
  },
  {
    tab: TabChoice.Log,
    title: 'Log',
    link: `/developer/${TabChoice.Log}`,
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
          <Route path="/develop">
            <ChainState/>
          </Route>
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
