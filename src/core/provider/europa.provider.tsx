import React, { Context, useCallback, useState } from 'react';
import { requireModule } from '../../shared';
import type * as ChildProcess from 'child_process';
import type * as Path from 'path';
import type * as FS from 'fs';
import type * as OS from 'os';

interface EuropaManageContextProps {
  europa?: ChildProcess.ChildProcessWithoutNullStreams;
  startup: (db: string, workspace: string) => Promise<ChildProcess.ChildProcessWithoutNullStreams | undefined>;
  change: (db: string, workspace: string) => Promise<ChildProcess.ChildProcessWithoutNullStreams | undefined>;
}

export const EuropaManageContext: Context<EuropaManageContextProps> = React.createContext({}as unknown as EuropaManageContextProps);

const startEuropa = async (db: string, workspace: string): Promise<ChildProcess.ChildProcessWithoutNullStreams | undefined> => {
  if (!requireModule.isElectron) {
    return Promise.resolve(undefined);
  }

  const europa = await new Promise<ChildProcess.ChildProcessWithoutNullStreams>((resolve, reject) => {
    const childProcess: typeof ChildProcess = requireModule('child_process');
    const path: typeof Path = requireModule('path');
    const fs: typeof FS = requireModule('fs');
    const os: typeof OS = requireModule('os');
    const platform = os.platform().toLowerCase();
    const resources = process.env.NODE_ENV === 'development'
      ? path.resolve('./resources')
      : path.resolve(__dirname, '../../app.asar.unpacked/resources');
    let binPath = path.resolve(resources, 'europa.exe');
  
    if (platform === 'linux' || platform === 'darwin') {
      binPath = path.resolve(resources, 'europa');
    }
    
    try {
      console.log(process.env.NODE_ENV, process.env.REACT_APP_ELECTRON_ENV);
      console.log(`platform:`, platform);
      console.log(`bin:`, binPath);
      console.log(`dir:`, __dirname);
      console.log('files:', fs.readdirSync(path.resolve(__dirname)));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../')));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../resources')));
      console.log('files:', fs.readdirSync(resources));
      console.log('files:', fs.readdirSync(path.resolve(__dirname, '../../')));
    } catch(e) {}
  
    console.log(binPath, db, workspace)
    const europa = childProcess.spawn(binPath, [`-d=${db}`, `-w=${workspace}`]);
    if (europa.pid) {
      resolve(europa);
    } else {
      console.log('failed')
      reject('Europa startup failed')
    }
  });

  return europa;
}

export const EuropaManageProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ europa, setEuropa ] = useState<ChildProcess.ChildProcessWithoutNullStreams>();

    const startup = useCallback(async (db: string, workspace: string) => {
      const europa = await startEuropa(db, workspace);

      setEuropa(europa);

      return europa;
    }, []);

    const change = useCallback(async (db: string, workspace: string) => {
      europa?.kill();
      return await startup(db, workspace);
    }, [europa, startup]);

    return <EuropaManageContext.Provider value={{
      europa,
      startup,
      change,
    }}>{children}</EuropaManageContext.Provider>;
  }
);
