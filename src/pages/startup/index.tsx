import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message, } from 'antd';
import styled from 'styled-components';
import { take, filter } from 'rxjs/operators';
import { ApiContext, BusContext, DEFAULT_WS_PORT, ErrorCode, EuropaManageContext, Setting, SettingContext } from '../../core';
import Logo from '../../assets/imgs/logo.png';
import { useHistory } from 'react-router-dom';
import EuropaSetting from '../setting/EuropaSetting';
import { requireModule, Style } from '../../shared';
import type * as Electron from 'electron';
import * as _ from 'lodash';

function createNewSetting(setting: Setting, database: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) {
  const newSetting = _.cloneDeep(setting);
  const db = newSetting.databases.find(db => db.path === database)
  
  !db?.workspaces.includes(workspace) && db?.workspaces.push(workspace);
  newSetting.lastChoosed = {
    database,
    workspace,
    httpPort,
    wsPort,
  };

  return newSetting;
}

const StartUp: FC<{ className: string }> = ({ className }): ReactElement => {
  const { update, setting, defaultDataBasePath } = useContext(SettingContext);
  const { startup } = useContext(EuropaManageContext);
  const { connect: connectApi } = useContext(ApiContext);
  const { connected$ } = useContext(BusContext);
  const [ loading, setLoading ] = useState<boolean>(false);
  const history = useHistory();

  const onStart = useCallback(async (database: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) => {
    if (!setting) {
      return;
    }

    setLoading(true)

    const newSetting = createNewSetting(setting, database, workspace, httpPort, wsPort);

    try {
      await update(newSetting);
    } catch (e) {
      message.error(`Could not store setting, code: ${ErrorCode.SaveSettingFailed}`);
      setLoading(false);
      return;
    }
 
    try {
      const europa = startup(database, workspace, { httpPort, wsPort });

      console.log('startup', europa)

      if (!europa.pid) {
        throw new Error('no pid');
      }

      // Wrong setting may cause Europa exit
      europa.once('exit', (e) => {console.log('europa exit', e)})
      europa.once('disconnect', (e: any) => {console.log('europa disconnect', e)})
      europa.once('error', (e) => {console.log('europa error', e)})
      europa.once('close', (code, signal) => {
        console.log('code', code, signal, typeof code);

        // 端口占用、数据文件权限、数据已存在且不兼容等 [europa程序启动了，但是异常退出]
        if (!!code) {
          const { ipcRenderer }: typeof Electron = requireModule('electron');

          ipcRenderer.send('message:pid-change', 0);
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
  }, [setting, update, history, connected$, connectApi, startup]);

  return (
    <div className={className}>
      <div className="content">
        <div className="title">
          <img src={Logo} alt="" />
          <h1>Europa is Ready!</h1>
        </div>
        <div className="setting">
          {
            setting &&
              <EuropaSetting initialSetting={{
                database: setting.lastChoosed?.database || defaultDataBasePath,
                workspace: setting.lastChoosed?.workspace || 'default',
                httpPort: setting.lastChoosed?.httpPort,
                wsPort: setting.lastChoosed?.wsPort,
              }}
              type="Start"
              onSubmit={onStart}
              loading={loading}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default React.memo(styled(StartUp)`
  height: 100%;
  background-color: ${Style.color.bg.default};
  padding: 20px;

  > .content {
    padding: 36px;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    justify-content: center;

    > .title {
      height: 60px;
      display: flex;
      align-items: center;
      width: 50%;
      max-width: 540px;
      margin-bottom: 40px;
      position: relative;
      justify-content: center;
      position: absolute;
      top: 40px;

      > img {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 60px;
        height: 60px;
      }
      > h1 {

      }
    }
    > .setting {
      width: 50%;
      max-width: 540px;
    }
  }
`);