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

  .tabs-area {
    height: 48px;
    padding-top: 8px;
    background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
    color: white;
  }
  .content {
    flex: 1;
    position: relative;

    > div {
      overflow-y: auto;
      overflow-x: hidden;
      position: absolute;
      bottom: 0px;
      left: 0px;
      top: 0px;
      right: 0px;
      padding: 20px;
    }
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
    title: 'Chain State',
    link: `/developer/${ActiveTab.ChainState}`,
  },
  {
    tab: ActiveTab.Extrinsic,
    title: 'Extrinsic',
    link: `/developer/${ActiveTab.Extrinsic}`,
  },
  {
    tab: ActiveTab.RpcCall,
    title: 'Rpc Calls',
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
      <div className="tabs-area">
        <PageTabs options={tabs} />
      </div>

      <div className="content">
        <div>
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
        </div>
      </div>
    </Wrapper>
  );
};
