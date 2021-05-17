import React, { FC, ReactElement, useContext } from 'react';
import { ApiContext } from './core/provider/api-provider';
import { Header } from './Header';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { Explorer } from './Explorer';
import { Setting } from './Setting';
import { Developer } from './Developer';
import { Contracts } from './Contracts';
import { Events } from './Events';
import { Extrinsics } from './Extrinsics';
import { Blocks } from './Blocks';
import { Accounts } from './Accounts';

const Main: FC = (): ReactElement => {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Switch>
          <Route path='/explorer'>
            <Explorer />
          </Route>
          <Route path='/accounts'>
            <Accounts />
          </Route>
          <Route path='/blocks'>
            <Blocks />
          </Route>
          <Route path='/extrinsics'>
            <Extrinsics />
          </Route>
          <Route path='/events'>
            <Events />
          </Route>
          <Route path='/contracts'>
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
