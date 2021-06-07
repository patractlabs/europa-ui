import React, { CSSProperties, FC, ReactElement } from 'react';
import styled from 'styled-components';
import { PageSize } from './PageSize';
import { PaginationR } from './Pagination';

const PaginationLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PageLine: FC<{ style?: CSSProperties }> = ({ style }): ReactElement => {
  return (
    <PaginationLine style={style}>
      <PageSize />
      <PaginationR />
    </PaginationLine>
  );
};
