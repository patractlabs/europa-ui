import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AccountsProvider, SettingProvider, BlocksProvider, ApiProvider, LogProvider, EuropaManageProvider } from './core';

ReactDOM.render(
  <React.StrictMode>
    <EuropaManageProvider>
      <SettingProvider>
        <ApiProvider>
          <LogProvider>
            <BlocksProvider>
              <AccountsProvider>
                <App />
              </AccountsProvider>
            </BlocksProvider>
          </LogProvider>
        </ApiProvider>
      </SettingProvider>
    </EuropaManageProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
