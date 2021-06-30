import React, { FC, ReactElement } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { Style } from '../../../shared';
import MoreSvg from '../../../assets/imgs/more.svg';

const { Option } = Select;

const Methods: FC<{
  value: {
    value: string;
    label: string;
    desc: string;
  };
  options: {
    value: string;
    label: string;
    desc: string;
  }[];
  onChange: (option: {
    value: string;
    label: string;
    desc: string;
  }) => void;
  className: string;
}> = ({ className, value, options, onChange }): ReactElement => {

  return (
    <div className={className}>
      <div className="span">{value.desc}</div>
      <Select
        bordered={false}
        value={value.value}
        onChange={value => onChange(options.find(item => item.value === value)!)}
        suffixIcon={<img src={MoreSvg} alt="" />}
      >
        {
          options.map(option =>
            <Option value={option.value} key={option.value}>{option.label}</Option>
          )
        }
      </Select>
    </div>
  );
};

export default React.memo(styled(Methods)`
  border: 1px solid ${Style.color.border.default};
  height: 48px;
  padding: 4px 16px;

  > .span {
    height: 16px;
    font-size: 12px;
    color: #8c8b8c;
    line-height: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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