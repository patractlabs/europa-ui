import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, message } from 'antd';
import styled from 'styled-components';
import { BlocksContext, BusContext, EuropaManageContext, LogsContext, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from './EuropaSetting';
import { take } from 'rxjs/operators';

const SettingPage: FC<{ className: string }> = ({ className }): ReactElement => {
  const { setChoosed, choosed } = useContext(SettingContext);
  const { clear: clearBlocks } = useContext(BlocksContext);
  const { clear: clearLogs } = useContext(LogsContext);
  const { change } = useContext(EuropaManageContext);
  const [ currentDbPath, setCurrentDbPath ] = useState<string>();
  const [ currentWorkspace, setCurrentWorkspace ] = useState<string>();
  const [ starting, setStarting ] = useState<boolean>(false);
  const history = useHistory();
  const { connected$ } = useContext(BusContext);

  const onChange = useCallback(() => {
    if (!currentWorkspace || !currentDbPath) {
      return;
    }

    setChoosed({
      database: currentDbPath,
      workspace: currentWorkspace,
    });
    setStarting(true)
    clearLogs();
    clearBlocks();
    change(currentDbPath, currentWorkspace, err => {
      setStarting(false);

      if (err) {
        console.log(err);
        message.error('Failed to start europa', 1);
      } else {
        connected$.pipe(
          take(1),
        ).subscribe(() => {
          console.log('history.push(explorer);');
          setStarting(false);
          history.push('/explorer');
        });
      }
    });
  }, [currentDbPath, currentWorkspace, setChoosed, history, change, clearLogs, clearBlocks, connected$]);

  return (
    <div className={className}>
      <Button loading={starting} className="change-button" onClick={onChange} disabled={!currentDbPath || !currentWorkspace || (currentWorkspace === choosed.workspace && currentDbPath === choosed.database)}>
        Change
      </Button>

      <EuropaSetting onChooseChange={(dbPath: string, workspace: string) => {
        setCurrentWorkspace(workspace);
        setCurrentDbPath(dbPath);
      }} />
    </div>
  );
};

export default React.memo(styled(SettingPage)`
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  .change-button {
    width: 200px;
    margin-bottom: 30px;
  }
`);