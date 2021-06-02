import React, { FC, ReactElement, useContext } from 'react';
import { ApiContext, PaginationProvider } from './core';
import { Header } from './pages/header/Header';
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { Explorer } from './pages/explorer/Explorer';
import { Setting } from './pages/setting/Setting';
import { Developer } from './pages/developer/Developer';
import { Contracts } from './pages/contract/Contracts';
import { Events } from './pages/events/Events';
import { ExtrinsicPage } from './pages/extrinsic';
import { Blocks } from './pages/blocks/Blocks';
import { Accounts } from './pages/account/Accounts';
import { EOA } from './pages/explorer/EOA';
import { CodeHash } from './pages/code-hash';
import { Contract } from './pages/contract/Contract';

const Main: FC = (): ReactElement => {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Switch>
          <Route exact path="/">
            <Redirect to="/explorer" />
          </Route>
          <Route path='/explorer' exact>
            <Explorer />
          </Route>
          <Route path='/explorer/code-hash/:codeHash'>
            <CodeHash />
          </Route>
          <Route path='/explorer/eoa/:address'>
            <PaginationProvider>
              <EOA />
            </PaginationProvider>
          </Route>
          <Route path='/explorer/contract/:address'>
            <PaginationProvider>
              <Contract />
            </PaginationProvider>
          </Route>
          <Route path='/account'>
            <Accounts />
          </Route>
          <Route path='/block'>
            <Blocks />
          </Route>
          <Route path='/extrinsic'>
            <ExtrinsicPage />
          </Route>
          <Route path='/event'>
            <Events />
          </Route>
          <Route path='/contract'>
            <Contracts />
          </Route>
          <Route path='/developer'>
            <Developer />
          </Route>
          <Route path='/setting'>
            <Setting />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

function App() {
  const { isApiReady } = useContext(ApiContext);
  
  if (isApiReady) {
    return <Main />;
  }
  return (
    <div className="App">
      connecting...
    </div>
  );
}

export default App;
