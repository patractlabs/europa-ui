import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { Style } from '../styled/const';

const PageSizeStyled = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 6px 16px;
`;

const NumberInput = styled.div`
  background: ${Style.color.bg.default};
  border-radius: 4px;
  border: 1px solid #BEAC92;
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
  background-color: #DBAA66;
  width: 16px;
  height: 10px;
`;
const Total = styled.span`
  margin-left: 10px;
  color: ${Style.color.label.primary};
  font-weight: bold;
`;

export const PageSize: FC = (): ReactElement => {
  const { pageSize, setPageSize, total } = useContext(PaginationContext);

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
      <Total>(Total {total})</Total>
    </PageSizeStyled>
  );
};