import React, { Context, useCallback, useEffect, useState } from 'react';
import { requireModule } from '../../shared';
import type * as FS from 'fs';
import type { App } from 'electron';
import type * as Path from 'path';

let CONFIG_PATH = '';

if (requireModule.isElectron) {
  const app: App = requireModule('electron').remote.app;
  const path: typeof Path = requireModule('path');
  const appDataPath = app.getPath('appData');

  CONFIG_PATH = path.resolve(appDataPath, 'europa-ui/user-config.json');
  console.log(CONFIG_PATH, 'CONFIG_PATH')
}

export interface Workspace {
  name: string;
  redspots: string[];
}

export interface Setting {
  databases: {
    path: string;
    workspaces: Workspace[];
  }[];
}

interface Choosed {
  database: string;
  workspace?: string;
}

interface SettingContextProps {
  setting: Setting;
  choosed: Choosed;
  reload: () => Promise<void>;
  update: (newSetting: Setting) => Promise<void>;
  setChoosed: React.Dispatch<React.SetStateAction<Choosed>>;
}

const DEFAULT_SETTING: Setting = {
  databases: [],
};

export const SettingContext: Context<SettingContextProps> = React.createContext({}as unknown as SettingContextProps);

async function load(): Promise<Setting> {
  const fs: typeof FS = requireModule('fs');
  const file = await fs.promises.readFile(CONFIG_PATH, {
    encoding: 'utf8',
    flag: 'r'
  });
  const config: Setting = JSON.parse(file.toString());

  console.log('config', config);

  return config;
}

async function write(setting: Setting): Promise<void> {
  const fs: typeof FS = requireModule('fs');

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
    const [ choosed, setChoosed ] = useState<Choosed>({ database: '', workspace: '' });

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
      choosed,
      setChoosed,
    }}>{children}</SettingContext.Provider>;
  }
);
