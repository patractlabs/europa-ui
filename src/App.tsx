import React, { FC, ReactElement } from 'react';
import { PaginationProvider } from './core';
import { Header } from './pages/header/Header';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Explorer } from './pages/explorer/Explorer';
import SettingPage from './pages/setting';
import { Developer } from './pages/developer/Developer';
import { ContractsPage } from './pages/contract';
import { EventsPage } from './pages/events';
import { ExtrinsicPage } from './pages/extrinsic';
import { Blocks } from './pages/blocks/Blocks';
import Accounts from './pages/account/Accounts';
import { EOA } from './pages/explorer/EOA';
import { CodeHash } from './pages/code-hash';
import { Contract } from './pages/contract/Contract';
import { BlockDetail } from './pages/blocks/BlockDetail';
import Startup from './pages/startup';
import styled from 'styled-components';
import { Style } from './shared';

const Wrapper = styled.div`
  height: 100%;
  background-color: ${Style.color.bg.default};
  display: flex;
  flex-direction: column;
`;

const Main: FC = (): ReactElement => {

  return (
    <Wrapper>
      <Header />
      <Switch>
        <Route path='/explorer' exact>
          <Explorer />
        </Route>
        <Route path='/contract/codes/:codeHash'>
          <CodeHash />
        </Route>
        <Route path='/explorer/eoa/:address'>
          <PaginationProvider>
            <EOA />
          </PaginationProvider>
        </Route>
        <Route path='/contract/instances/:address'>
          <PaginationProvider>
            <Contract />
          </PaginationProvider>
        </Route>
        <Route path='/account'>
          <Accounts />
        </Route>
        <Route path='/block' exact>
          <PaginationProvider defaultPageSize={15}>
            <Blocks />
          </PaginationProvider>
        </Route>
        <Route path='/block/:blockHash'>
          <BlockDetail />
        </Route>
        <Route path='/extrinsic'>
          <ExtrinsicPage />
        </Route>
        <Route path='/event'>
          <EventsPage />
        </Route>
        <Route exact path="/contract">
          <Redirect to="/contract/codes" />
        </Route>
        <Route path='/contract/:part'>
          <ContractsPage />
        </Route>
        <Route exact path="/developer">
          <Redirect to="/developer/chainState" />
        </Route>
        <Route path='/developer/:part'>
          <Developer />
        </Route>
        <Route path='/setting'>
          <SettingPage />
        </Route>
      </Switch>
    </Wrapper>
  );
};

function App() {

  return (
    <Switch>
      <Route exact path="/">
        <Startup />
      </Route>
      <Route path='/'>
        <Main />
      </Route>
    </Switch>
  );
}

export default App;
