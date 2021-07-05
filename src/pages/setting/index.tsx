import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message } from 'antd';
import styled from 'styled-components';
import { BlocksContext, BusContext, EuropaManageContext, LogsContext, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from './EuropaSetting';
import { take, filter } from 'rxjs/operators';
import { Style } from '../../shared';
import * as _ from 'lodash';

const SettingPage: FC<{ className: string }> = ({ className }): ReactElement => {
  const { update, setting } = useContext(SettingContext);
  const { clear: clearBlocks } = useContext(BlocksContext);
  const { clear: clearLogs } = useContext(LogsContext);
  const { change } = useContext(EuropaManageContext);
  const [ loading, setLoading ] = useState<boolean>(false);
  const history = useHistory();
  const { connected$ } = useContext(BusContext);

  const onChange = useCallback((dbPath: string, workspace: string) => {
    setLoading(true);
    clearLogs();
    clearBlocks();
    
    const newSetting = _.cloneDeep(setting);
    const db = newSetting.databases.find(db => db.path === dbPath)
    
    !db?.workspaces.includes(workspace) && db?.workspaces.push(workspace);
    newSetting.lastChoosed = {
      database: dbPath,
      workspace,
    };
    update(newSetting);

    change(dbPath, workspace).then(europa => {
      europa?.once('close', (code, signal) => {
        console.log('code', code, signal, typeof code);

        if (!!code) {
          setLoading(false);
          message.error(`Europa exited unexpectly`, 3);
        }
      });
      connected$.pipe(
        filter(c => !!c),
        take(1),
      ).subscribe(() => {
        console.log('history.push(explorer);');
        setLoading(false);
        history.push('/explorer');
      });
    }, err => {
      console.log(err);
      setLoading(false);
      message.error('Failed to start europa', 1);
    });
  }, [setting, update, history, change, clearLogs, clearBlocks, connected$]);

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