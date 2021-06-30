import React, { FC, ReactElement } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { Style } from '../../../shared';
import MoreSvg from '../../../assets/imgs/more.svg';

const { Option } = Select;

const Sections: FC<{
  defaultValue?: string;
  options: string[];
  onChange: (option: string) => void;
  className: string;
  span: string;
}> = ({ className, defaultValue, options, onChange, span }): ReactElement => {

  return (
    <div className={className}>
      <div className="span">{span}</div>
      <Select
        bordered={false}
        defaultValue={defaultValue}
        onChange={onChange as any}
        suffixIcon={<img src={MoreSvg} alt="" />}
      >
        {
          options.map((option, index) =>
            <Option value={option} key={index}>{option}</Option>
          )
        }
      </Select>
    </div>
  );
};

export default React.memo(styled(Sections)`
  border: 1px solid ${Style.color.border.default};
  border-right-width: 0px;
  height: 48px;
  padding: 4px 16px;
  padding-right: 0px;

  > .span {
    height: 16px;
    font-size: 12px;
    color: #8c8b8c;
    line-height: 16px;
  }

  > .ant-select {
    width: 100%;

    .ant-select-selector {
      padding: 0px;
      height: 16px;

      > .ant-select-selection-item {
        height: 16px;
        opacity: 1;
        font-size: 14px;
        font-weight: 500;
        color: ${Style.color.label.primary};
        line-height: 16px;
      }
    }
  }
`);
