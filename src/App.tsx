import React, { FC, ReactElement, useContext } from 'react';
import { ApiContext } from './api-context';
// import type { HeaderExtended } from '@polkadot/api-derive/types';
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
  // const { api } = useContext(ApiContext);
  // const [ lastHeaders, setLastHeaders ] = useState<HeaderExtended[]>([]);

  // useEffect(() => {
  //   let _lastHeaders: HeaderExtended[] = [];

  //   const sub = api.derive.chain.subscribeNewHeads().subscribe((lastHeader): void => {

  //     if (!lastHeader.number) {
  //       return;
  //     }

  //     if (
  //       _lastHeaders.find(
  //         header => header.number.unwrap().eq(
  //           lastHeader.number.unwrap()
  //         )
  //       )
  //     ) {
  //       return;
  //     }

  //     _lastHeaders.push(lastHeader);
  //     _lastHeaders = _lastHeaders
  //       .sort((a, b) => b.number.unwrap().cmp(
  //         a.number.unwrap())
  //       )
  //       .slice(0, 5);
  //     // console.log('headers', _lastHeaders);

  //     setLastHeaders([..._lastHeaders]);
  //   });

  //   return () => sub.unsubscribe();
  // }, [api.derive.chain]);
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
