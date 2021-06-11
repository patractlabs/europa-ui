import React, { CSSProperties, FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { PageSize } from './PageSize';
import { PaginationR } from './Pagination';

const PaginationLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PageLine: FC<{ style?: CSSProperties, showWhenSingle?: boolean }> = ({ style, showWhenSingle = false }): ReactElement => {
  const { total, pageSize } = useContext(PaginationContext);
  
  if (total > pageSize && showWhenSingle) {
    return (
      <PaginationLine style={style}>
        <PageSize />
        <PaginationR />
      </PaginationLine>
    );
  }

  return null as any;
};
