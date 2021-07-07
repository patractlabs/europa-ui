import React, { Context, useCallback, useState } from 'react';
import { requireModule } from '../../shared';
import type * as ChildProcess from 'child_process';
import type * as Path from 'path';
import type * as FS from 'fs';
import type * as OS from 'os';

interface EuropaManageContextProps {
  europa?: ChildProcess.ChildProcessWithoutNullStreams;
  startup: (
    db: string,
    workspace: string,
    options?: EuropaOptions,
  ) => Promise<ChildProcess.ChildProcessWithoutNullStreams>;
  change: (
    db: string,
    workspace: string,
    options?: EuropaOptions,
  ) => Promise<ChildProcess.ChildProcessWithoutNullStreams>;
}
export interface EuropaOptions {
  httpPort?: number;
  wsPort?: number;
}

export const EuropaManageContext: Context<EuropaManageContextProps> = React.createContext({}as unknown as EuropaManageContextProps);

const startEuropa = async (db: string, workspace: string, options?: EuropaOptions): Promise<ChildProcess.ChildProcessWithoutNullStreams> => {
  if (!requireModule.isElectron) {
    return Promise.resolve(undefined as unknown as ChildProcess.ChildProcessWithoutNullStreams);
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
  
    const optionsMap = {
      httpPort: '--rpc-port=',
      wsPort: '--ws-port=',
    }
    const args = [`-d=${db}`, `-w=${workspace}`]
      .concat(!options ?
        [] :
        Object
        .keys(options)
        .filter(key => options[key as 'httpPort' | 'wsPort'])
        .map(key => `${optionsMap[key as 'httpPort' | 'wsPort']}${options[key as 'httpPort' | 'wsPort']}`)
      );

    console.log('args:', args);

    const europa = childProcess.spawn(binPath, args);

    if (europa.pid) {
      console.log('europa.pid', europa.pid, europa)
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

    const startup = useCallback(async (db: string, workspace: string, options?: EuropaOptions) => {
      const europa = await startEuropa(db, workspace, options);

      setEuropa(europa);

      return europa;
    }, []);

    const change = useCallback(async (db: string, workspace: string, options?: EuropaOptions) => {
      europa?.kill();
      return await startup(db, workspace, options);
    }, [europa, startup]);

    return <EuropaManageContext.Provider value={{
      europa,
      startup,
      change,
    }}>{children}</EuropaManageContext.Provider>;
  }
);
