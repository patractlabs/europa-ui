import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components'
import { Pagination } from 'antd';
import { PaginationContext } from '../../core/provider/pagination.provider';

const PaginationStyled = styled.div`
  background-color: white;
  padding: 6px;
`;

export const PaginationR: FC = (): ReactElement => {
  const { pageIndex, setPageIndex, total } = useContext(PaginationContext);

  return (
    <PaginationStyled>
      <Pagination defaultCurrent={1} current={pageIndex} total={total} onChange={ index => setPageIndex(index)} ></Pagination>
    </PaginationStyled>
  );
};