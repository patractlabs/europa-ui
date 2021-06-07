import React, { FC, ReactElement, useContext } from 'react';
import styled from 'styled-components'
import { Pagination } from 'antd';
import { PaginationContext } from '../../core';
import { Style } from '../styled';
import PreSVG from '../../assets/imgs/pre.svg';
import NextSVG from '../../assets/imgs/next.svg';

const PaginationStyled = styled.div`
  > ul li {
    background-color: white;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${Style.color.button.primary};
    border-radius: 4px;
    width: 28px;
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    margin-right: 4px;
    a {
      color: ${Style.color.label.primary};
    }
  }
  > ul li:last-child {
    margin-right: 0px;
  }
  
  .ant-pagination-disabled {
    border: 1px solid ${Style.color.border.default};
  }

  .ant-pagination-item:hover {
    background-color: ${Style.color.button.primary};
    border: 1px solid ${Style.color.button.primary};
    > a {
      color: white;
    }
  }
  
  .ant-pagination-item-active {
    background-color: ${Style.color.button.primary};

    > a {
      color: white;
    }
  }

  .ant-pagination-jump-next, .ant-pagination-jump-prev {
    background-color: ${Style.color.bg.default};
    border-width: 0px;
    display: inline-flex;
    align-items: flex-end;
  }
`;

function itemRender(page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', originalElement: React.ReactElement<HTMLElement>) {
  if (type === 'prev') {
    return <img src={PreSVG} alt="" />;
  }
  if (type === 'next') {
    return <img src={NextSVG} alt="" />;
  }
  if (type === 'jump-prev' || type === 'jump-next') {
    return (
      <div style={{ height: '2px', width: '10px', display: 'inline-flex', justifyContent: 'space-between', marginBottom: '6px'}}>
        <div style={{ height: '2px', width: '2px', background: Style.color.label.primary }}></div>
        <div style={{ height: '2px', width: '2px', background: Style.color.label.primary }}></div>
        <div style={{ height: '2px', width: '2px', background: Style.color.label.primary }}></div>
      </div>
    );
  }

  return originalElement;
}

export const PaginationR: FC = (): ReactElement => {
  const { pageIndex, setPageIndex, total, pageSize } = useContext(PaginationContext);

  return (
    <PaginationStyled>
      <Pagination itemRender={itemRender} style={{ height: '28px' }} showSizeChanger={false} defaultCurrent={1} current={pageIndex} total={total} pageSize={pageSize} onChange={ index => setPageIndex(index)} ></Pagination>
    </PaginationStyled>
  );
};