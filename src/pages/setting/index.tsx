import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message } from 'antd';
import styled from 'styled-components';
import { ApiContext, BlocksContext, BusContext, DEFAULT_WS_PORT, ErrorCode, EuropaManageContext, LogsContext, Setting, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from './EuropaSetting';
import { take, filter } from 'rxjs/operators';
import { requireModule, Style } from '../../shared';
import type * as Electron from 'electron';
import * as _ from 'lodash';

function createNewSetting(setting: Setting, database: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) {
  const newSetting = _.cloneDeep(setting);
  const db = newSetting.databases.find(db => db.path === database)
  
  if (!db) {
    newSetting.databases.push({ path: database, workspaces: [workspace] });
  } else if (!db.workspaces.includes(workspace)) {
    db.workspaces.push(workspace);
  }

  newSetting.lastChoosed = {
    database,
    workspace,
    httpPort,
    wsPort,
  };

  return newSetting;
}

const SettingPage: FC<{ className: string }> = ({ className }): ReactElement => {
  const { update, setting, defaultDataBasePath } = useContext(SettingContext);
  const { clear: clearBlocks } = useContext(BlocksContext);
  const { connect: connectApi } = useContext(ApiContext);
  const { clear: clearLogs } = useContext(LogsContext);
  const { change } = useContext(EuropaManageContext);
  const [ loading, setLoading ] = useState<boolean>(false);
  const history = useHistory();
  const { connected$ } = useContext(BusContext);

  const onChange = useCallback(async (database: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) => {
    if (!setting) {
      return;
    }

    setLoading(true);
    clearLogs();
    clearBlocks();
    
    const newSetting = createNewSetting(setting, database, workspace, httpPort, wsPort);

    try {
      await update(newSetting);
    } catch (e) {
      message.error(`Could not store setting, code: ${ErrorCode.SaveSettingFailed}`);
      setLoading(false);
      return;
    }
 
    try {
      const europa = change(database, workspace, { httpPort, wsPort });

      console.log('change', europa)

      if (!europa.pid) {
        throw new Error('no pid');
      }

      // Wrong setting may cause Europa exit
      europa.once('exit', (e) => {console.log('europa exit', e)})
      europa.once('disconnect', (e: any) => {console.log('europa disconnect', e)})
      europa.once('error', (e) => {console.log('europa error', e)})
      europa.once('close', (code, signal) => {
        const { ipcRenderer }: typeof Electron = requireModule('electron');
        
        console.log('code', code, signal, typeof code);
        ipcRenderer.send('message:pid-change', 0);
        // 端口占用、数据文件权限、数据已存在且不兼容等 [europa程序启动了，但是异常退出]
        if (!!code) {
          setLoading(false);
          message.error(`Europa exited unexpectly, code: ${ErrorCode.RunClashed}`, 3);
        }
      });
    } catch (e) {
      console.log(e);

      setLoading(false);
      message.error(`Failed to start Europa, code: ${ErrorCode.StartFailed}`, 3);
      return;
    }

    connectApi(wsPort || DEFAULT_WS_PORT);

    connected$.pipe(
      filter(c => !!c),
      take(1),
    ).subscribe(() => {
      console.log('history.push(explorer);');

      setLoading(false);
      history.push('/explorer');
    });
  }, [setting, update, history, change, clearLogs, clearBlocks, connected$, connectApi]);

  return (
    <div className={className}>
      <div className="content">
        <div className="setting">
          {
            setting &&
              <EuropaSetting initialSetting={{
                database: setting.lastChoosed?.database || defaultDataBasePath,
                workspace: setting.lastChoosed?.workspace || 'default',
                httpPort: setting.lastChoosed?.httpPort,
                wsPort: setting.lastChoosed?.wsPort,
              }}
              type="Change"
              onSubmit={onChange}
              loading={loading}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default React.memo(styled(SettingPage)`
  background-color: ${Style.color.bg.default};
  padding: 20px;
  flex: 1;

  > .content {
    padding: 36px;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;

    > .setting {
      width: 50%;
    }
  }
`);