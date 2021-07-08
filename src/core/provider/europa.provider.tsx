import React, { Context, useCallback, useState } from 'react';
import { requireModule } from '../../shared';
import type * as ChildProcess from 'child_process';
import type * as Path from 'path';
import type * as OS from 'os';
// import { ipcRenderer } from 'electron';
import type * as Electron from 'electron';

interface EuropaManageContextProps {
  europa?: ChildProcess.ChildProcessWithoutNullStreams;
  startup: (
    db: string,
    workspace: string,
    options?: EuropaOptions,
  ) => ChildProcess.ChildProcessWithoutNullStreams;
  change: (
    db: string,
    workspace: string,
    options?: EuropaOptions,
  ) => ChildProcess.ChildProcessWithoutNullStreams;
}
export interface EuropaOptions {
  httpPort?: number;
  wsPort?: number;
}

export const EuropaManageContext: Context<EuropaManageContextProps> = React.createContext({}as unknown as EuropaManageContextProps);

const startEuropa = (db: string, workspace: string, options?: EuropaOptions): ChildProcess.ChildProcessWithoutNullStreams => {
  if (!requireModule.isElectron) {
    return undefined as unknown as ChildProcess.ChildProcessWithoutNullStreams;
  }

  const childProcess: typeof ChildProcess = requireModule('child_process');
  const path: typeof Path = requireModule('path');
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
    console.log('NODE_ENV', process.env.NODE_ENV);
    console.log(`platform:`, platform);
    console.log(`bin:`, binPath);
    console.log(`dir:`, __dirname);
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

  console.log('europa.pid', europa.pid, europa)

  return europa;
}

export const EuropaManageProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ europa, setEuropa ] = useState<ChildProcess.ChildProcessWithoutNullStreams>();

    const startup = useCallback((db: string, workspace: string, options?: EuropaOptions) => {
      const europa = startEuropa(db, workspace, options);
      const { ipcRenderer }: typeof Electron = requireModule('electron');

      ipcRenderer.send('message:pid-change', europa.pid);
      setEuropa(europa);

      return europa;
    }, []);

    const change = useCallback((db: string, workspace: string, options?: EuropaOptions) => {
      europa?.kill();

      return startup(db, workspace, options);
    }, [europa, startup]);

    return <EuropaManageContext.Provider value={{
      europa,
      startup,
      change,
    }}>{children}</EuropaManageContext.Provider>;
  }
);
