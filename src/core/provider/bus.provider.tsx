import React, { Context, useState } from 'react';
import { Subject } from 'rxjs';

interface BusContextProps {
  connected$: Subject<boolean>;
}

export const BusContext: Context<BusContextProps> = React.createContext({}as unknown as BusContextProps);

export const BusProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [ connected$ ] = useState<Subject<boolean>>(new Subject());

    return <BusContext.Provider value={{
      connected$
    }}>{children}</BusContext.Provider>;
  }
);
