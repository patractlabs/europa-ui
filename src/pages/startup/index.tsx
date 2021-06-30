import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, message, } from 'antd';
import styled from 'styled-components';
import { take } from 'rxjs/operators';
import { BusContext, EuropaManageContext, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from '../setting/EuropaSetting';

const StartUp: FC<{ className: string }> = ({ className }): ReactElement => {
  const { setChoosed } = useContext(SettingContext);
  const { startup } = useContext(EuropaManageContext);
  const { connected$ } = useContext(BusContext);
  const [ currentDbPath, setCurrentDbPath ] = useState<string>();
  const [ currentWorkspace, setCurrentWorkspace ] = useState<string>();
  const [ starting, setStarting ] = useState<boolean>(false);
  const history = useHistory();

  const onStart = useCallback(() => {
    if (!currentWorkspace || !currentDbPath) {
      return;
    }

    setChoosed({
      database: currentDbPath,
      workspace: currentWorkspace,
    });
    setStarting(true)
    startup(currentDbPath, currentWorkspace, err => {

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
  }, [currentDbPath, currentWorkspace, setChoosed, history, startup, connected$]);

  return (
    <div className={className}>
      <Button loading={starting} className="start-button" onClick={onStart} disabled={!currentDbPath || !currentWorkspace}>
        Start
      </Button>

      <EuropaSetting onChooseChange={(dbPath: string, workspace: string) => {
        setCurrentWorkspace(workspace);
        setCurrentDbPath(dbPath);
      }} />
    </div>
  );
};

export default React.memo(styled(StartUp)`
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  .start-button {
    width: 200px;
    margin-bottom: 30px;
  }
`);