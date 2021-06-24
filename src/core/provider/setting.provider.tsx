import React, { Context, useCallback, useEffect, useState } from 'react';

export interface Workspace {
  path: string;
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
  workspace: string;
}

interface SettingContextProps {
  setting: Setting;
  choosed: Choosed;
  reload: () => Promise<void>;
  update: () => Promise<void>;
  setChoosed: React.Dispatch<React.SetStateAction<Choosed>>;
}

const DEFAULT_SETTING: Setting = {
  databases: [
    {
      path: '',
      workspaces: [
        {
          path: '',
          redspots: [
          ],
        },
      ],
    },
  ],
};

export const SettingContext: Context<SettingContextProps> = React.createContext({}as unknown as SettingContextProps);

export const SettingProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ setting, setSetting ] = useState<Setting>(DEFAULT_SETTING);
    const [ choosed, setChoosed ] = useState<Choosed>({ database: '', workspace: '' });

    const reload = useCallback(async () => {}, []);
    const update = useCallback(async () => {}, []);

    useEffect(() => {
  
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
