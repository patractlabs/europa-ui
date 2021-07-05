import React, { Context, useCallback, useEffect, useState } from 'react';
import { requireModule } from '../../shared';
import type * as FS from 'fs';
import type { App } from 'electron';
import type * as Path from 'path';

let CONFIG_PATH = '';
let DATA_PATH = '';

if (requireModule.isElectron) {
  const app: App = requireModule('electron').remote.app;
  const path: typeof Path = requireModule('path');
  const appDataPath = app.getPath('appData');

  CONFIG_PATH = path.resolve(appDataPath, 'europa-ui/user-config.json');
  DATA_PATH = path.resolve(appDataPath, 'europa-ui');

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
  }
}

interface SettingContextProps {
  setting: Setting;
  reload: () => Promise<void>;
  update: (newSetting: Setting) => Promise<void>;
  defaultDataBasePath: string;
  configPath: string;
}

const DEFAULT_SETTING: Setting = {
  databases: [],
  redspots: [],
};

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
  
  console.log('config', setting);

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

  console.log('writed', data);
}

export const SettingProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ setting, setSetting ] = useState<Setting>(DEFAULT_SETTING);
    const [ [defaultDataBasePath, configPath] ] = useState<[string, string]>([DATA_PATH, CONFIG_PATH]);

    const reload = useCallback(async () => {}, []);
    const update = useCallback(async (newSetting: Setting) => {
      await write(newSetting);
      setSetting(newSetting);
    }, []);

    useEffect(() => {
      if (!requireModule.isElectron) {
        return;
      }

      load().then(setting => setSetting(setting), () => {});
    }, []);

    return <SettingContext.Provider value={{
      setting,
      reload,
      update,
      defaultDataBasePath,
      configPath,
    }}>{children}</SettingContext.Provider>;
  }
);
