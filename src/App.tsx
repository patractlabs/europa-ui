import React, { FC, ReactElement, useContext } from 'react';
import { ApiContext } from './core/provider/api.provider';
import { Header } from './Header';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { Explorer } from './explorer/Explorer';
import { Setting } from './Setting';
import { Developer } from './Developer';
import { Contracts } from './Contracts';
import { Events } from './Events';
import { Extrinsics } from './extrinsic/Extrinsics';
import { Blocks } from './Blocks';
import { Accounts } from './Accounts';
import { EOA } from './explorer/EOA';
import styled from 'styled-components';
import { PaginationProvider } from './core/provider/pagination.provider';

const Bg = styled.div`
  background-color: #F8F8F8;
`;

const Main: FC = (): ReactElement => {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Switch>
          <Route path='/explorer' exact>
            <Explorer />
          </Route>
          <Route path='/explorer/eoa/:address'>
            <PaginationProvider>
              <EOA />
            </PaginationProvider>
          </Route>
          <Route path='/account'>
            <Accounts />
          </Route>
          <Route path='/block'>
            <Blocks />
          </Route>
          <Route path='/extrinsic'>
            <Extrinsics />
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
