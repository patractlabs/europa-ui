import React, { useState } from 'react';

const PaginationContext: React.Context<{
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  pageIndex: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
}> = React.createContext({} as any);

interface Props {
  children: React.ReactNode;
  defaultPageSize?: number;
  defaultPageIndex?: number;
  defaultTotal?: number;
}

const PaginationProvider = React.memo(({ children, defaultPageSize = 10, defaultPageIndex = 1, defaultTotal = 0 }: Props): React.ReactElement<Props> =>  {
  const [ pageSize, setPageSize ] = useState<number>(defaultPageSize);
  const [ pageIndex, setPageIndex ] = useState<number>(defaultPageIndex);
  const [ total, setTotal ] = useState<number>(defaultTotal);

  return (
    <PaginationContext.Provider
      value={{
        pageSize,
        setPageSize,
        pageIndex,
        setPageIndex,
        total,
        setTotal,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
});

export { PaginationContext, PaginationProvider };
