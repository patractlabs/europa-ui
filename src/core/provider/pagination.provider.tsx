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
}

const PaginationProvider = React.memo(({ children }: Props): React.ReactElement<Props> =>  {
  const [ pageSize, setPageSize ] = useState<number>(5);
  const [ pageIndex, setPageIndex ] = useState<number>(1);
  const [ total, setTotal ] = useState<number>(0);

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
