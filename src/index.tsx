import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BlocksProvider, ApiProvider, LogProvider } from './core';
import { AccountsProvider } from './core/provider/accounts.provider';

ReactDOM.render(
  <React.StrictMode>
    <ApiProvider>
      <LogProvider>
        <BlocksProvider>
          <AccountsProvider>
            <App />
          </AccountsProvider>
        </BlocksProvider>
      </LogProvider>
    </ApiProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
