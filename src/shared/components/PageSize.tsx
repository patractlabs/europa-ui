import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { PaginationContext } from '../../core';
import { Style } from '../styled/const';
import StepSvg from '../../assets/imgs/step.svg';

const PageSizeStyled = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const NumberInput = styled.div`
  border-radius: 4px;
  border: 1px solid ${Style.color.button.primary};
  height: 28px;
  display: flex;
  align-items: center;
  padding: 6px 4px 6px 8px;
  margin: 0px 10px;
  > span {
    font-weight: 600;
  }
`;

const StepHolder = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 4px;
`;

const Step = styled.img<{ up: boolean }>`
  cursor: pointer;
  width: 16px;
  height: 8px;
  object-position: ${props => props.up ? 'top' : 'bottom'};
  object-fit: cover;
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
          <Step onClick={ () => setPageSize(pageSize + 1)} src={StepSvg} up={true} />
          <Step onClick={ () => setPageSize(pageSize - 1)} src={StepSvg} up={false} />
        </StepHolder>
      </NumberInput>
      Records
      <Total>(Total {total})</Total>
    </PageSizeStyled>
  );
};