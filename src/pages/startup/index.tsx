import { Button, Input, message, Select } from 'antd';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { EuropaManageContext, Setting, SettingContext, Workspace } from '../../core';
import AddSvg from '../../assets/imgs/add-account.svg';
import { requireModule, Style } from '../../shared';
import type * as Electron from 'electron';
import { useHistory } from 'react-router-dom';
import * as _ from 'lodash';

const { Option } = Select;

function getMergedDbs (setting: Setting, newSetting: Setting) {
  return setting.databases.concat(newSetting.databases);
}

function getMergedWorkspaces(setting: Setting, newSetting: Setting, dbPath: string): Workspace[] {
  return getMergedDbs(setting, newSetting).find(db => db.path === dbPath)?.workspaces || [];
}

function getMergedRedspots(setting: Setting, newSetting: Setting, dbPath: string, workspacePath: string): string[] {
  return getMergedWorkspaces(setting, newSetting, dbPath)
    .find(workspace => workspace.path === workspacePath)?.redspots || [];
}

function getMergedDefaultWorkspace(setting: Setting, newSetting: Setting, dbPath: string): string {
  return getMergedWorkspaces(setting, newSetting, dbPath)[0]?.path || '';
}

const StartUp: FC<{ className: string }> = ({ className }): ReactElement => {
  const { setting, setChoosed } = useContext(SettingContext);
  const { startup } = useContext(EuropaManageContext);
  const [ tempSetting, setTempSetting ] = useState<Setting>({ databases: [] });
  const [ dbPath, setDbPath ] = useState<string>(setting.databases[0]?.path || '');
  const [ workspacePath, setWorkspacePath ] = useState<string>(
    getMergedDefaultWorkspace(setting, tempSetting, dbPath)
  );
  const [ newWorkspacePath, setNewWorkspacePath ] = useState<string>('');
  const [ starting, setStarting ] = useState<boolean>(false);
  const history = useHistory();

  const onStart = useCallback(() => {
    setChoosed({
      database: dbPath,
      workspace: workspacePath,
    });
    setStarting(true)
    startup(dbPath, workspacePath, result => {
      setStarting(false);

      if (result) {
        history.push('/explorer');
      } else {
        message.error('Failed to start europa', 1);
      }
    });
  }, [dbPath, workspacePath, setChoosed, history, startup]);

  const onAddDb = useCallback(() => {
    console.log('aaaaaaaaaa')
    if (!requireModule.isElectron) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    console.log('ipcRenderer', ipcRenderer)
    ipcRenderer.send('req:choose-dir');
    ipcRenderer.once('res:choose-dir', (_, databasePath) => {
      console.log('dir', databasePath);

      setDbPath(databasePath);
      setWorkspacePath('');

      if (getMergedDbs(setting, tempSetting).find(db => db.path === databasePath)) {
        return;
      }

      setTempSetting(setting => ({
        ...setting,
        databases: setting.databases.concat({
          path: databasePath,
          workspaces: [],
        }),
      }));
    });
  }, [setting, tempSetting]);

  const onAddWorkspace = useCallback(() => {
    console.log('bbb')
    setWorkspacePath(newWorkspacePath);

    if (getMergedWorkspaces(setting, tempSetting, dbPath).find(w => w.path === newWorkspacePath)) {
      return;
    }

    setTempSetting(setting => {
      const newSetting = _.cloneDeep(setting);
      const workspaces = newSetting.databases
        .find(db => db.path === dbPath)?.workspaces || [];
      
      console.log('newSetting', JSON.parse(JSON.stringify(newSetting.databases)), workspaces.concat({ path: newWorkspacePath, redspots: [] }))
      newSetting.databases
        .find(db => db.path === dbPath)!.workspaces = workspaces.concat({ path: newWorkspacePath, redspots: [] });
        
      return newSetting;
    });
    setNewWorkspacePath('');
  }, [dbPath, newWorkspacePath, setting, tempSetting]);

  const onAddRedspot = useCallback(() => {
    if (!requireModule.isElectron) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    console.log('ipcRenderer', ipcRenderer)
    ipcRenderer.send('req:choose-file');
    ipcRenderer.once('res:choose-file', (event, redspotPath) => {
      console.log('file', redspotPath);
      
      if (getMergedRedspots(setting, tempSetting, dbPath, workspacePath).find(r => r === redspotPath)) {
        return;
      }

      setTempSetting(setting => {
        const newSetting = _.cloneDeep(setting);
        const redspots = newSetting.databases
          .find(db => db.path === dbPath)?.workspaces
          .find(workspace => workspace.path === workspacePath)?.redspots || [];
        
        newSetting.databases
          .find(db => db.path === dbPath)!.workspaces
          .find(workspace => workspace.path === workspacePath)!.redspots = redspots.concat(redspotPath);
          
        return newSetting;
      });
    });
  }, [dbPath, setting, tempSetting, workspacePath]);

  console.log('saaa', getMergedWorkspaces(setting, tempSetting, dbPath), getMergedWorkspaces(setting, tempSetting, dbPath));
  return (
    <div className={className}>
      <Button loading={starting} className="start-button" onClick={onStart} disabled={!dbPath || !workspacePath}>
        Start
      </Button>

      <div className="selection">
        <div className="select-col">
          <div className="select-wrapper">
            <Select
              className="db-select"
              value={dbPath}
              onChange={(value: string) => {
                setDbPath(value);
                setWorkspacePath(getMergedDefaultWorkspace(setting, tempSetting, value));
              }}
            >
              {
                getMergedDbs(setting, tempSetting).map(db =>
                  <Option value={db.path} key={db.path}>{db.path}</Option>
                )
              }
            </Select>
            <Button
              className="add-button"
              onClick={onAddDb}
              icon={
                <img src={AddSvg} alt="" />
              }
            >database</Button>
          </div>
        </div>

        <div className="select-col">
          <div className="select-wrapper">
            <Select className="workspace-select" value={workspacePath} onChange={(value: string) => setWorkspacePath(value)}>
              {
                getMergedWorkspaces(setting, tempSetting, dbPath).map(workspace =>
                  <Option value={workspace.path} key={workspace.path}>{workspace.path}</Option>
                )
              }
            </Select>
            <Input className="new-workspace" value={newWorkspacePath} onChange={e => setNewWorkspacePath(e.target.value)} />
            <Button
              className="button-add"
              disabled={!dbPath || !!getMergedWorkspaces(setting, tempSetting, dbPath).find(w => w.path ===newWorkspacePath)}
              icon={
                <img src={AddSvg} alt="" />
              }
              onClick={onAddWorkspace}
            >workspace</Button>
          </div>
          <h3>Redspot Projects</h3>
          <div className="redspot-projects">
            {
              getMergedRedspots(setting, tempSetting, dbPath, workspacePath).map(redspot =>
                <div key={redspot}>{redspot}</div>
              )
            }
          </div>
          <div>
            <Button style={{ width: '100%' }} onClick={onAddRedspot} >Add</Button>
          </div>
        </div>
      </div>
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
  .add-button {
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    > img {
      margin-right: 5px;
    }
  }

  .selection {
    min-width: 900px;
    display: flex;

    .select-col {
      flex: 1;
      &:first-child {
        margin-right: 50px;
      }

      .select-wrapper {
        display: flex;

        .db-select, .workspace-select {
          flex: 1;
        }
        .workspace-select {
          margin-right: 10px;
        }
      }
      h3 {
        margin-top: 15px;
        padding-left: 15px;
      }
      .redspot-projects {
        background-color: white;
        margin: 5px 0px 15px 0px;
        border: 1px solid ${Style.color.border.default};
        padding: 15px;
      }
      .new-workspace {
        width: 100px;
      }
    }
  }
`);