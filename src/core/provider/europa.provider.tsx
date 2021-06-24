import React, { Context, useCallback, useState } from 'react';
import { requireModule } from '../../shared';
import type * as ChildProcess from 'child_process';
import type * as Path from 'path';
import type * as FS from 'fs';
import type * as OS from 'os';

interface EuropaManageContextProps {
  europa?: ChildProcess.ChildProcessWithoutNullStreams;
  startup: (db: string, workspace: string, cb: (result: boolean) => void) => void;
}

export const EuropaManageContext: Context<EuropaManageContextProps> = React.createContext({}as unknown as EuropaManageContextProps);

const startEuropa = (db: string, workspace: string) => {
  if (!requireModule.isElectron) {
    return;
  }

  try {
    const childProcess: typeof ChildProcess = requireModule('child_process');
    const path: typeof Path = requireModule('path');
    const fs: typeof FS = requireModule('fs');
    const os: typeof OS = requireModule('os');
    const platform = os.platform().toLowerCase();
    const resources = process.env.NODE_ENV === 'development'
      ? path.resolve('/')
      : path.resolve(__dirname, '../../app.asar.unpacked/resources');
    let binPath = path.resolve(resources, 'europa.exe');
  
    console.log(process.env.NODE_ENV, process.env.REACT_APP_ELECTRON_ENV);
    if (platform === 'linux' || platform === 'darwin') {
      binPath = path.resolve(resources, 'europa');
    }
  
    try {
      console.log(`platform:`, platform);
      console.log(`bin:`, binPath);
      console.log(`dir:`, __dirname);
      console.log('files:', fs.readdirSync(path.resolve(__dirname)));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../')));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../resources')));
      console.log('files:', fs.readdirSync(resources));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../../')));
    } catch(e) {}

    return childProcess.spawn(binPath, [`-d=${db}`, `-w=${workspace}`]);
  } catch(e) {
    console.log('failed to startup europa', e);
  }
}

export const EuropaManageProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ europa, setEuropa ] = useState<ChildProcess.ChildProcessWithoutNullStreams>();

    const startup = useCallback((db: string, workspace: string, cb: (result: boolean) => void) => {
      const europa = startEuropa(db, workspace);

      setEuropa(europa);
      cb(!!europa);
    }, []);

    return <EuropaManageContext.Provider value={{
      europa,
      startup,
    }}>{children}</EuropaManageContext.Provider>;
  }
);
