import React, { useCallback, useEffect, useState } from 'react';
import { requireModule } from '../../shared';

const LogContext: React.Context<{
  logs: string[];
  clear: () => void;
}> = React.createContext({
  logs: [],
} as any);

interface Props {
  children: React.ReactNode;
}

const LogProvider = React.memo(({ children }: Props): React.ReactElement<Props> =>  {
  const [ logs, setLogs ] = useState<string[]>([]);

  const clear = useCallback(() => {
    setLogs([]);
  }, []);
  
  useEffect(() => {
    if (!requireModule.isElectron) {
      setLogs([
        '2021-06-10 18:44:33  Low open file descriptor limit configured for the process. Current value: 4096, recommended value: 10000.',
        '2021-06-10 18:44:33  Europa Dev Node',
        '2021-06-10 18:44:33  ✌️  version 0.2.1-6422ea8-x86_64-linux-gnu',
        '2021-06-10 18:44:33  ❤️  by patract labs <https://github.com/patractlabs>, 2020-2021',
        '2021-06-10 18:44:33  📋 Chain specification: Development',
        '2021-06-10 18:44:33  💾 Database: RocksDb at /home/freepoix/.local/share/europa/default/chains/dev/db',
        '2021-06-10 18:44:33  📖 Workspace: default | Current workspace list: ["default"]',
        '2021-06-10 18:44:33  ⛓  Native runtime: europa-3 (europa-1.tx1.au1)',
        '2021-06-10 18:44:33  📦 Highest known block at #33',
        '2021-06-10 18:44:33  Listening for new connections on 127.0.0.1:9944.',
        '2021-06-10 18:44:34  Accepted a new tcp connection from 127.0.0.1:42598.',
        '2021-06-10 18:44:34  Accepted a new tcp connection from 127.0.0.1:42600.',
      ]);
    }
  }, []);

  return (
    <LogContext.Provider
      value={{
        logs,
        clear,
      }}
    >
      {children}
    </LogContext.Provider>
  );
});

export { LogContext, LogProvider };
