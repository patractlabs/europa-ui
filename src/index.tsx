import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AccountsProvider, BusProvider, SettingProvider, BlocksProvider, ApiProvider, LogsProvider, EuropaManageProvider } from './core';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <BusProvider>
      <EuropaManageProvider>
        <SettingProvider>
          <ApiProvider>
            <LogsProvider>
              <BlocksProvider>
                <AccountsProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </AccountsProvider>
              </BlocksProvider>
            </LogsProvider>
          </ApiProvider>
        </SettingProvider>
      </EuropaManageProvider>
    </BusProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
