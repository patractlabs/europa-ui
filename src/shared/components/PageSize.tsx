import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core/provider/pagination.provider';

const PageSizeStyled = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 6px 16px;
`;

const NumberInput = styled.div`
  background: #F6F5F7;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 6px 7px;
  margin-left: 11px;
  margin-right: 10px;
`;

const StepHolder = styled.div`
  width: 16px;
  height: 21px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 4px;
`;

const Step = styled.div`
  background-color: #7C44FF;
  width: 16px;
  height: 10px;
`;

export const PageSize: FC = (): ReactElement => {
  const { pageSize, setPageSize } = useContext(PaginationContext);

  return (
    <PageSizeStyled>
      Show
      <NumberInput>
        <span>{ pageSize }</span>
        <StepHolder>
          <Step onClick={ () => setPageSize(pageSize + 1)}></Step>
          <Step onClick={ () => setPageSize(pageSize - 1)}></Step>
        </StepHolder>
      </NumberInput>
      items
    </PageSizeStyled>
  );
};