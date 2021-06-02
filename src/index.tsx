import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BlocksProvider, ApiProvider } from './core';
import { AccountsProvider } from './core/provider/accounts.provider';

ReactDOM.render(
  <React.StrictMode>
    <ApiProvider>
      <BlocksProvider>
        <AccountsProvider>
          <App />
        </AccountsProvider>
      </BlocksProvider>
    </ApiProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
