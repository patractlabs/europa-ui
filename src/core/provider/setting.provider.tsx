import React, { Context, useCallback, useEffect, useState } from 'react';
import { requireModule } from '../../shared';
import type * as FS from 'fs';
import type { App } from 'electron';
import type * as Path from 'path';
import { EuropaOptions } from './europa.provider';

let CONFIG_PATH = '';
let DATA_PATH = '';
const DEFAULT_SETTING: Setting = {
  databases: [],
  redspots: [],
};

if (requireModule.isElectron) {
  const app: App = requireModule('electron').remote.app;
  const path: typeof Path = requireModule('path');
  const appDataPath = app.getPath('appData');

  CONFIG_PATH = path.resolve(appDataPath, 'europa-ui/user-config.json');
  DATA_PATH = path.resolve(appDataPath, 'europa-node');

  console.log(CONFIG_PATH, 'CONFIG_PATH')
}

export interface Setting {
  databases: {
    path: string;
    workspaces: string[];
  }[];
  redspots: string[];
  lastChoosed?: {
    database: string;
    workspace: string;
  } & EuropaOptions;
  external?: {
    address: string;
    enabled: boolean;
  };
}

interface SettingContextProps {
  setting?: Setting;
  update: (newSetting: Setting) => Promise<void>;
  defaultDataBasePath: string;
  configPath: string;
}
export const DEFAULT_WORKSPACE = 'default';
export const DEFAULT_HTTP_PORT = 9933;
export const DEFAULT_WS_PORT = 9944;
export const SettingContext: Context<SettingContextProps> = React.createContext({}as unknown as SettingContextProps);

async function load(): Promise<Setting> {
  const fs: typeof FS = requireModule('fs');
  const file = await fs.promises.readFile(CONFIG_PATH, {
    encoding: 'utf8',
    flag: 'r'
  });
  const setting: Setting = JSON.parse(file.toString());

  setting.redspots = setting.redspots || [];
  setting.databases = (setting.databases || []).map(d => ({path: d.path, workspaces: d.workspaces || []}));
  
  console.log('load config', setting);

  return setting;
}

async function write(setting: Setting): Promise<void> {
  const fs: typeof FS = requireModule('fs');

  setting.redspots = setting.redspots || [];
  setting.databases = (setting.databases || []).map(d => ({path: d.path, workspaces: d.workspaces || []}));

  const data = JSON.stringify(setting);
  await fs.promises.writeFile(CONFIG_PATH, data, {
    encoding: 'utf8',
    flag: 'w'
  });

  console.log('writed config', data);
}

export const SettingProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ setting, setSetting ] = useState<Setting>();

    const update = useCallback(async (newSetting: Setting) => {
      await write(newSetting);
      setSetting(newSetting);
    }, []);

    useEffect(() => {
      if (!requireModule.isElectron) {
        return;
      }

      load().then(setting => setSetting(setting), () => setSetting(DEFAULT_SETTING));
    }, []);

    return <SettingContext.Provider value={{
      setting,
      update,
      defaultDataBasePath: DATA_PATH,
      configPath: CONFIG_PATH,
    }}>{children}</SettingContext.Provider>;
  }
);
