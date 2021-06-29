import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';

const TabChoices = styled.div`
  display: inline-flex;
  width: fit-content;
  background-color: ${Style.color.bg.second};
  border-radius: 8px 8px 0px 0px;
`;
const TabChoice = styled.div<{ active: 'self' | 'left' | 'right' | 'none' }>`
  cursor: pointer;
  text-align: center;
  line-height: 48px;
  height: 48px;
  background: ${props => props.active === 'left' || props.active === 'right' ? 'white' : Style.color.bg.second };
  font-size: 16px;
  color: ${props => props.active === 'self' ? Style.color.primary : Style.color.label.primary};
  &:first-child {
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
  &:first-child div {
    border-top-left-radius: 8px;
  }
  &:last-child div {
    border-top-right-radius: 8px;
  }
  > div {
    padding: 0px 32px;
    background-color: ${props => props.active === 'self' ? 'white' : Style.color.bg.second};
    border-radius: ${props => {
      if (props.active === 'self') {
        return '8px 8px 0px 0px';
      } else if (props.active === 'left') {
        return '0px 0px 8px 0px';
      } else if (props.active === 'right') {
        return '0px 0px 0px 8px';
      }
      return '0px';
    }};
  }
`;

export const Tabs: FC<{
  options: { name: string; value: string }[];
  defaultValue?: string;
  onChange: (value: any) => void;
  style?: React.CSSProperties;
}> = ({ options, defaultValue, onChange, style = {} }): ReactElement => {
  const [ choosed, setChoosed ] = useState<any>(defaultValue || options[0]?.value);

  return (
    <TabChoices style={style}>
      {
        options.map((option, index) =>
          <TabChoice
            active={choosed === option.value ? 'self' : (choosed === options[index - 1]?.value ? 'right' : (choosed === options[index + 1]?.value ? 'left' : 'none'))}
            key={option.value}
            className={ choosed === option.value ? 'tab-choosed' : '' }
            onClick={() => {
              setChoosed(option.value);

              if (choosed !== option.value) {
                onChange(option.value);
              }
            }}
          >
            <div>{ option.name }</div>
          </TabChoice>
        )
      }
    </TabChoices>
  );
};
