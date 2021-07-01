import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Input, Select } from 'antd';
import styled from 'styled-components';
import { Setting, SettingContext } from '../../core';
import { requireModule, Style } from '../../shared';
import AddSvg from '../../assets/imgs/add-account.svg';
import type * as Electron from 'electron';
import * as _ from 'lodash';

const { Option } = Select;

function getDefaultWorkspace(setting: Setting, dbPath: string): string {
  return setting.databases.find(db => db.path === dbPath)?.workspaces[0]?.name || '';
}

let t = 0;

const EuropaSetting: FC<{ className: string, onChooseChange: (dbPath: string | undefined, workspace: string | undefined) => void }> = ({ className, onChooseChange }): ReactElement => {
  const { setting, update, choosed } = useContext(SettingContext);
  const [ currentDbPath, setCurrentDbPath ] = useState<string>();
  const [ currentWorkspace, setCurrentWorkspace ] = useState<string>();
  const [ newWorkspace, setNewWorkspace ] = useState<string>('');

  useEffect(() => {
    onChooseChange(currentDbPath, currentWorkspace);
  }, [currentDbPath, currentWorkspace, onChooseChange]);

  useEffect(() => {
    // hacking, should be fixed.
    t += 1;

    if (t !== 2) {
      choosed.database && setCurrentDbPath(choosed.database);
      choosed.workspace && setCurrentWorkspace(choosed.workspace);
      return;
    }

    const dbPath = setting.databases[0]?.path || '';

    setCurrentDbPath(dbPath);
    setCurrentWorkspace(getDefaultWorkspace(setting, dbPath));
  }, [setting, choosed]);

  const workspaces = useMemo(
    () => setting.databases.find(db => db.path === currentDbPath)?.workspaces || [],
    [currentDbPath, setting],
  );

  const redspots = useMemo(
    () => workspaces.find(w => w.name === currentWorkspace)?.redspots || [],
    [workspaces, currentWorkspace],
  );

  const onAddDb = useCallback(() => {
    if (!requireModule.isElectron) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    ipcRenderer.send('req:choose-dir');
    ipcRenderer.once('res:choose-dir', (event, databasePath) => {
      if (currentDbPath === databasePath) {
        return;
      }

      setCurrentDbPath(databasePath);
      setCurrentWorkspace('');

      if (setting.databases.find(db => db.path === databasePath)) {
        return;
      }

      const newSetting = _.cloneDeep(setting);

      newSetting.databases = newSetting.databases.concat({
        path: databasePath,
        workspaces: [],
      })
      update(newSetting);
    });
  }, [setting, currentDbPath, update]);

  const onAddWorkspace = useCallback(() => {
    setCurrentWorkspace(newWorkspace);

    if (workspaces.find(w => w.name === newWorkspace)) {
      return;
    }

    const newSetting = _.cloneDeep(setting);
    const db = newSetting.databases.find(db => db.path === currentDbPath);
    
    if (!db) {
      return;
    }
    
    db.workspaces = db.workspaces.concat({ name: newWorkspace, redspots: [] });
    update(newSetting);
    setNewWorkspace('');
  }, [currentDbPath, newWorkspace, setting, workspaces, update]);

  const onAddRedspot = useCallback(() => {
    if (!requireModule.isElectron) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    ipcRenderer.send('req:choose-file', {
      filters: [
        { name: 'Redspot config file', extensions: ['ts'] },
      ]
    });
    ipcRenderer.once('res:choose-file', (event, redspotPath: string) => {
      console.log('file', redspotPath);
      
      if (!redspotPath.endsWith('redspot.config.ts') ||  redspots.find(r => r === redspotPath)) {
        return;
      }

      console.log('aaa')
      const newSetting = _.cloneDeep(setting);
      const workspace = newSetting.databases
        .find(db => db.path === currentDbPath)?.workspaces
        .find(workspace => workspace.name === currentWorkspace);
      
      if (!workspace) {
        return;
      }
      console.log('workspace', workspace)

      workspace.redspots = workspace.redspots.concat(redspotPath);
      update(newSetting);
    });
  }, [currentDbPath, setting, currentWorkspace, redspots, update]);

  return (
    <div className={className}>
      <div className="select-col">
        <div className="select-wrapper">
          <Select
            className="db-select"
            value={currentDbPath}
            onChange={(value: string) => {
              console.log('change')
              setCurrentDbPath(value);
              setCurrentWorkspace(getDefaultWorkspace(setting, value));
            }}
          >
            {
              setting.databases.map(db =>
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
          <Select allowClear={true} className="workspace-select" value={currentWorkspace} onChange={(value: string) => setCurrentWorkspace(value)}>
            {
              workspaces.map(workspace =>
                <Option value={workspace.name} key={workspace.name}>{workspace.name}</Option>
              )
            }
          </Select>
          <Input className="new-workspace" value={newWorkspace} onChange={e => setNewWorkspace(e.target.value)} />
          <Button
            className="add-button"
            disabled={!newWorkspace || !currentDbPath || !!workspaces.find(w => w.name ===newWorkspace)}
            icon={
              <img src={AddSvg} alt="" />
            }
            onClick={onAddWorkspace}
          >workspace</Button>
        </div>
        <h3>Redspot Projects</h3>
        <div className="redspot-projects">
          {
            redspots.map(redspot =>
              <div key={redspot}>{redspot}</div>
            )
          }
        </div>
        <div>
          <Button
            style={{ width: '100%' }}
            onClick={onAddRedspot}
            disabled={!currentDbPath || !currentWorkspace}
          >Add redspot project</Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(styled(EuropaSetting)`
  min-width: 900px;
  display: flex;

  .add-button {
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    > img {
      margin-right: 5px;
    }
  }

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
`);