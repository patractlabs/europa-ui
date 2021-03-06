import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Checkbox, Dropdown, Menu, Tooltip, Button } from 'antd';
import styled from 'styled-components';
import {
  DEFAULT_HTTP_PORT,
  DEFAULT_WS_PORT,
  EuropaOptions,
  SettingContext,
} from '../../core';
import { requireModule, Style } from '../../shared';
import AddSvg from '../../assets/imgs/add-redspot.svg';
import InfoSvg from '../../assets/imgs/info.svg';
import MoreSvg from '../../assets/imgs/more.svg';
import MoreDisabledSvg from '../../assets/imgs/more-disabled.svg';
import FileSvg from '../../assets/imgs/file-select.svg';
import FileDisabledSvg from '../../assets/imgs/file-select-disabled.svg';
import DeleteSvg from '../../assets/imgs/delete-redspot.svg';
import type * as Electron from 'electron';
import * as _ from 'lodash';
import { Toggle } from '../../react-components';

const EuropaSetting: FC<{
  type: 'Change' | 'Start';
  className?: string;
  onSubmit: (
    dbPath: string,
    workspace: string,
    httpPort: number | undefined,
    wsPort: number | undefined
  ) => void;
  onConnect: (endpoint: string) => void;
  loading: boolean;
  initialSetting: {
    database: string;
    workspace: string;
    external: {
      address: string;
      enabled: boolean;
    };
  } & EuropaOptions;
}> = ({
  className,
  onSubmit,
  onConnect,
  type,
  loading,
  initialSetting,
}): ReactElement => {
  const { setting, update } = useContext(SettingContext);
  const [currentDbPath, setCurrentDbPath] = useState<string>(
    initialSetting.database
  );
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(
    initialSetting.workspace
  );
  const [showMore, setShowMore] = useState<boolean>(type === 'Change');
  const [dbExpanded, setDbExpanded] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(false);
  const [httpPort, setHttpPort] = useState<number | undefined>(
    initialSetting.httpPort
  );
  const [wsPort, setWsPort] = useState<number | undefined>(
    initialSetting.wsPort
  );
  const [externalEndpoint, setExternalEndpoint] = useState<string>(
    initialSetting.external.address
  );
  const [useExternal, setUseExternal] = useState<boolean>(
    !!initialSetting.external.enabled
  );

  const ArgsChanged = useMemo(() => {
    if (!setting) {
      return false;
    }

    return (
      !setting.lastChoosed ||
      setting.lastChoosed.database !== currentDbPath ||
      setting.lastChoosed.workspace !== currentWorkspace ||
      (setting.lastChoosed.httpPort &&
        httpPort !== setting.lastChoosed.httpPort) ||
      (!setting.lastChoosed.httpPort &&
        httpPort &&
        httpPort !== DEFAULT_HTTP_PORT) ||
      (setting.lastChoosed.wsPort && wsPort !== setting.lastChoosed.wsPort) ||
      (!setting.lastChoosed.wsPort && wsPort && wsPort !== DEFAULT_WS_PORT)
    );
  }, [setting, currentDbPath, currentWorkspace, httpPort, wsPort]);

  const endpointChanged = useMemo(() => {
    if (!setting) {
      return false;
    }

    return !setting.external || setting.external.address !== externalEndpoint;
  }, [setting, externalEndpoint]);

  const submitDisabled = useMemo(() => {
    const enabledChanged = useExternal !== initialSetting.external.enabled;

    if (useExternal) {
      return (
        !externalEndpoint ||
        (type === 'Change' && !endpointChanged && !enabledChanged)
      );
    }

    return (
      !currentDbPath ||
      !currentWorkspace ||
      (type === 'Change' && !ArgsChanged && !enabledChanged)
    );
  }, [
    useExternal,
    externalEndpoint,
    type,
    endpointChanged,
    currentDbPath,
    currentWorkspace,
    ArgsChanged,
    initialSetting.external.enabled,
  ]);

  useEffect(() => {}, [setting]);

  const onAddDb = useCallback(() => {
    if (!requireModule.isElectron || !setting) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    ipcRenderer.send('req:choose-dir');
    ipcRenderer.once('res:choose-dir', (event, databasePath) => {
      setCurrentDbPath(databasePath);

      if (setting.databases.find(db => db.path === databasePath)) {
        return;
      }

      const newSetting = _.cloneDeep(setting);

      newSetting.databases = newSetting.databases.concat({
        path: databasePath,
        workspaces: [],
      });
      update(newSetting);
    });
  }, [setting, update]);

  const onAddRedspot = useCallback(() => {
    if (!requireModule.isElectron || !setting) {
      return;
    }

    const { ipcRenderer }: typeof Electron = requireModule('electron');

    ipcRenderer.send('req:choose-file', {
      filters: [{ name: 'Redspot config file', extensions: ['ts'] }],
    });
    ipcRenderer.once('res:choose-file', (event, redspotPath: string) => {
      console.log(
        'file',
        redspotPath,
        redspotPath.endsWith('redspot.config.ts'),
        setting.redspots.find(r => r === redspotPath)
      );

      if (
        !redspotPath.endsWith('redspot.config.ts') ||
        setting.redspots.find(r => r === redspotPath)
      ) {
        return;
      }

      const newSetting = _.cloneDeep(setting);

      newSetting.redspots = newSetting.redspots.concat(redspotPath);
      update(newSetting);
    });
  }, [setting, update]);

  const onDeleteRedspot = useCallback(() => {
    if (!setting) {
      return;
    }

    const newSetting = _.cloneDeep(setting);

    newSetting.redspots = newSetting.redspots.slice(
      0,
      setting.redspots.length - 1
    );
    update(newSetting);
  }, [setting, update]);

  const deleteDatabase = useCallback(
    (index: number) => {
      const newSetting = _.cloneDeep(setting);

      newSetting?.databases.splice(index, 1);
      newSetting && update(newSetting);
    },
    [setting, update]
  );

  const deleteWorkspace = useCallback(
    (index: number) => {
      const newSetting = _.cloneDeep(setting);
      const workspaces = newSetting?.databases.find(
        db => db.path === currentDbPath
      )?.workspaces;

      workspaces?.splice(index, 1);
      newSetting && workspaces && update(newSetting);
    },
    [setting, update, currentDbPath]
  );

  const workspaceMenu = useMemo(() => {
    const workspaces = setting?.databases.find(
      db => db.path === currentDbPath
    )?.workspaces;

    return workspaces && workspaces.length ? (
      <Menu>
        {workspaces.map((w, index) => (
          <Menu.Item
            key={index}
            icon={
              <img
                onClick={e => {
                  deleteWorkspace(index);
                  e.stopPropagation();
                }}
                src={DeleteSvg}
                alt=''
              />
            }
            onClick={() => {
              setCurrentWorkspace(w);
              setWorkspaceExpanded(false);
            }}
          >
            {w}
          </Menu.Item>
        ))}
      </Menu>
    ) : (
      <></>
    );
  }, [currentDbPath, setting, deleteWorkspace]);

  const DatabaseMenu = useMemo(
    () =>
      setting?.databases.length ? (
        <Menu>
          {setting.databases.map((d, index) => (
            <Menu.Item
              key={index}
              icon={
                <img
                  onClick={e => {
                    deleteDatabase(index);
                    e.stopPropagation();
                  }}
                  src={DeleteSvg}
                  alt=''
                />
              }
              onClick={() => {
                setCurrentDbPath(d.path);
                setDbExpanded(false);
              }}
            >
              {d.path}
            </Menu.Item>
          ))}
        </Menu>
      ) : (
        <></>
      ),
    [setting?.databases, deleteDatabase]
  );

  return (
    <div className={className}>
      <div className='database'>
        <div className='info-line'>
          <div className='span'>
            <span>Database Path</span>
            <Tooltip placement='top' title='database store directory'>
              <img src={InfoSvg} alt='' />
            </Tooltip>
          </div>
        </div>
        <div
          className={
            useExternal ? 'value-line value-line-disabled' : 'value-line'
          }
        >
          <Dropdown
            disabled={useExternal}
            overlay={DatabaseMenu}
            trigger={['click']}
            onVisibleChange={setDbExpanded}
          >
            <div className='dropdown'>
              <input
                disabled={useExternal}
                style={{ paddingRight: '36px' }}
                placeholder='/path/to/data'
                value={currentDbPath}
                onChange={e => setCurrentDbPath(e.target.value)}
              />
              {useExternal ? (
                <img
                  className={dbExpanded ? 'expanded' : ''}
                  src={MoreDisabledSvg}
                  alt=''
                />
              ) : (
                <img
                  className={dbExpanded ? 'expanded' : ''}
                  src={MoreSvg}
                  alt=''
                />
              )}
            </div>
          </Dropdown>
        </div>
        <div
          style={{ cursor: useExternal ? '' : 'pointer' }}
          className='file-select'
          onClick={() => useExternal || onAddDb()}
        >
          {useExternal ? (
            <img src={FileDisabledSvg} alt='' />
          ) : (
            <img src={FileSvg} alt='' />
          )}
        </div>
      </div>

      <div className='info-line'>
        <div className='span'>
          <span>Workspace</span>
          <Tooltip placement='top' title='subdirectory of database'>
            <img src={InfoSvg} alt='' />
          </Tooltip>
        </div>
      </div>
      <div
        className={
          useExternal ? 'value-line value-line-disabled' : 'value-line'
        }
      >
        <Dropdown
          disabled={useExternal}
          overlay={workspaceMenu}
          trigger={['click']}
          onVisibleChange={setWorkspaceExpanded}
        >
          <div className='dropdown'>
            <input
              disabled={useExternal}
              style={{ paddingRight: '36px' }}
              placeholder='default'
              value={currentWorkspace}
              onChange={e => setCurrentWorkspace(e.target.value)}
            />
            {useExternal ? (
              <img
                className={workspaceExpanded ? 'expanded' : ''}
                src={MoreDisabledSvg}
                alt=''
              />
            ) : (
              <img
                className={workspaceExpanded ? 'expanded' : ''}
                src={MoreSvg}
                alt=''
              />
            )}
          </div>
        </Dropdown>
      </div>

      {showMore && (
        <div className='more-options'>
          <div className='info-line'>
            <div className='span'>
              <span>HTTP Port</span>
            </div>
          </div>
          <div
            className={
              useExternal ? 'value-line value-line-disabled' : 'value-line'
            }
          >
            <input
              disabled={useExternal}
              placeholder={`${DEFAULT_HTTP_PORT}`}
              value={httpPort}
              onChange={e =>
                setHttpPort(
                  `${parseInt(e.target.value)}` === 'NaN'
                    ? undefined
                    : parseInt(e.target.value)
                )
              }
            />
          </div>

          <div className='info-line'>
            <div className='span'>
              <span>WS Port</span>
            </div>
          </div>
          <div
            className={
              useExternal ? 'value-line value-line-disabled' : 'value-line'
            }
          >
            <input
              disabled={useExternal}
              placeholder={`${DEFAULT_WS_PORT}`}
              value={wsPort}
              onChange={e =>
                setWsPort(
                  `${parseInt(e.target.value)}` === 'NaN'
                    ? undefined
                    : parseInt(e.target.value)
                )
              }
            />
          </div>
        </div>
      )}

      <div className='external'>
        <div className='info-line'>
          <div className='span'>
            <span>External Endpoint</span>
          </div>
        </div>
        <div
          className={
            !useExternal ? 'value-line value-line-disabled' : 'value-line'
          }
        >
          <input
            disabled={!useExternal}
            placeholder='ws://'
            value={externalEndpoint}
            onChange={e => setExternalEndpoint(e.target.value)}
          />
        </div>
        <div className='toggle'>
          <Toggle
            value={useExternal}
            onChange={() => setUseExternal(show => !show)}
          />
        </div>
      </div>

      {showMore && (
        <div className='more-options'>
          <div className='info-line'>
            <div className='span'>
              <span>Redspot Projects</span>
            </div>
            <div className='operation'>
              <div onClick={onAddRedspot}>
                <img src={AddSvg} alt='' />
                Add
              </div>
              <div onClick={onDeleteRedspot}>
                <img src={DeleteSvg} alt='' />
                Delete
              </div>
            </div>
          </div>
          <div className='value-line'>
            {setting?.redspots.map((redspot, index) => (
              <div className='redspot-line' key={index}>
                <input disabled={true} value={redspot} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className='submit'
        style={{
          justifyContent: type === 'Start' ? 'space-between' : 'flex-end',
        }}
      >
        {type === 'Start' && (
          <Checkbox
            checked={showMore}
            onClick={() => setShowMore(show => !show)}
          >
            <span>More Options</span>
          </Checkbox>
        )}
        <Button
          type='primary'
          style={{ width: '124px', height: '40px' }}
          disabled={submitDisabled}
          loading={loading}
          onClick={() =>
            useExternal
              ? onConnect(externalEndpoint)
              : onSubmit(currentDbPath, currentWorkspace, httpPort, wsPort)
          }
        >
          {type}
        </Button>
      </div>
    </div>
  );
};

export default styled(EuropaSetting)`
  .database {
    position: relative;

    > .file-select {
      position: absolute;
      bottom: 0px;
      right: -52px;
      width: 44px;
      height: 44px;
      background: #ffffff;
      border: 1px solid ${Style.color.border.default};
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        background-color: ${Style.color.bg.default};
      }
      > img {
        width: 20px;
        height: 16px;
      }
    }
  }
  .external {
    position: relative;

    > .toggle {
      position: absolute;
      right: -52px;
      top: 42px;
    }
  }

  .info-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    > .span {
      font-size: 16px;
      font-weight: 600;
      color: ${Style.color.label.primary};
      display: flex;
      align-items: center;

      > span {
        margin-right: 8px;
      }

      > img {
        cursor: pointer;
      }
    }
    > .operation {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: ${Style.color.label.primary};

      > div {
        cursor: pointer;
        display: flex;
        align-items: center;
        &:first-child {
          margin-right: 20px;
        }

        img {
          margin-right: 8px;
        }
      }
    }
  }

  .value-line {
    margin-bottom: 20px;

    input {
      width: 100%;
      height: 44px;
      background: white;
      border: 1px solid ${Style.color.border.default};
      border-radius: 4px;
      padding: 14px 12px;
    }
    > .dropdown {
      position: relative;

      > img {
        position: absolute;
        top: 14px;
        right: 14px;
      }

      > .expanded {
        transform: scaleY(-1);
      }
    }
  }
  .value-line-disabled {
    input {
      color: #bab8c0;
      background-color: ${Style.color.bg.disabled};
    }
  }
  > .more-options {
    margin-bottom: 20px;

    > .redspot-line {
      margin-bottom: 8px;

      > input {
        width: 100%;
        height: 44px;
        background: white;
        border: 1px solid ${Style.color.border.default};
        border-radius: 4px;
        padding: 14px 12px;
      }
    }
  }
  > .submit {
    display: flex;
    align-items: center;

    .ant-checkbox-checked .ant-checkbox-inner {
      box-shadow: none;
      background: #beac92;
      border-color: #beac92;
    }
  }
`;
