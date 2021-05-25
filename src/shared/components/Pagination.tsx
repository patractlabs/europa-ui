import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components'
import { Pagination } from 'antd';
import { PaginationContext } from '../../core';

const PaginationStyled = styled.div`
  background-color: white;
  padding: 6px;
`;

export const PaginationR: FC = (): ReactElement => {
  const { pageIndex, setPageIndex, total, pageSize } = useContext(PaginationContext);

  return (
    <PaginationStyled>
      <Pagination defaultCurrent={1} current={pageIndex} total={total} pageSize={pageSize} onChange={ index => setPageIndex(index)} ></Pagination>
    </PaginationStyled>
  );
};