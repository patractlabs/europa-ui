import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message } from 'antd';
import styled from 'styled-components';
import { ApiContext, BlocksContext, BusContext, ErrorCode, EuropaManageContext, LogsContext, Setting, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from './EuropaSetting';
import { take, filter } from 'rxjs/operators';
import { Style } from '../../shared';
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
  const { update, setting } = useContext(SettingContext);
  const { clear: clearBlocks } = useContext(BlocksContext);
  const { connect: connectApi, disconnect } = useContext(ApiContext);
  const { clear: clearLogs } = useContext(LogsContext);
  const { change } = useContext(EuropaManageContext);
  const [ loading, setLoading ] = useState<boolean>(false);
  const history = useHistory();
  const { connected$ } = useContext(BusContext);

  const onChange = useCallback(async (database: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) => {
    setLoading(true);
    clearLogs();
    clearBlocks();
    
    const newSetting = createNewSetting(setting, database, workspace, httpPort, wsPort);

    try {
      await update(newSetting);
    } catch (e) {
      message.error(`Could not store setting, code: ${ErrorCode.SaveSettingFailed}`);
      return;
    }
 
    try {
      const europa = await change(database, workspace, { httpPort, wsPort });

      // Wrong setting may cause Europa exit
      europa.once('close', (code, signal) => {
        console.log('code', code, signal, typeof code);
  
        if (!!code) {
          setLoading(false);
          disconnect();
          message.error(`Europa exited unexpectly, code: ${ErrorCode.RunClashed}`, 3);
        }
      });
    } catch (e) {
      console.log(e);

      setLoading(false);
      message.error(`Failed to start Europa, code: ${ErrorCode.StartFailed}`, 3);
      return;
    }

    connectApi(wsPort || 9944);

    connected$.pipe(
      filter(c => !!c),
      take(1),
    ).subscribe(() => {
      console.log('history.push(explorer);');

      setLoading(false);
      history.push('/explorer');
    });
  }, [setting, update, history, change, clearLogs, clearBlocks, connected$, connectApi, disconnect]);

  return (
    <div className={className}>
      <div className="content">
        <div className="setting">
          <EuropaSetting type="Change" onSubmit={onChange} loading={loading} />
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