import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, message } from 'antd';
import styled from 'styled-components';
import { EuropaManageContext, SettingContext } from '../../core';
import { useHistory } from 'react-router-dom';
import EuropaSetting from './EuropaSetting';

const SettingPage: FC<{ className: string }> = ({ className }): ReactElement => {
  const { setChoosed } = useContext(SettingContext);
  const { startup } = useContext(EuropaManageContext);
  const [ currentDbPath, setCurrentDbPath ] = useState<string>();
  const [ currentWorkspace, setCurrentWorkspace ] = useState<string>();
  const [ starting, setStarting ] = useState<boolean>(false);
  const history = useHistory();

  const onChange = useCallback(() => {
    if (!currentWorkspace || !currentDbPath) {
      return;
    }

    setChoosed({
      database: currentDbPath,
      workspace: currentWorkspace,
    });
    setStarting(true)
    startup(currentDbPath, currentWorkspace, err => {
      setStarting(false);

      if (err) {
        console.log(err);
        message.error('Failed to start europa', 1);
      } else {
        history.push('/explorer');
      }
    });
  }, [currentDbPath, currentWorkspace, setChoosed, history, startup]);

  return (
    <div className={className}>
      <Button loading={starting} className="change-button" onClick={onChange} disabled={!currentDbPath || !currentWorkspace}>
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