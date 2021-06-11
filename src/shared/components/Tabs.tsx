import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';

const TabChoices = styled.div`
  display: flex;

  >.tab-choosed {
    color: ${Style.color.primary};
    background-color: white;
  }

`;
const TabChoice = styled.div`
  cursor: pointer;
  padding: 0px 32px;
  text-align: center;
  line-height: 48px;
  height: 48px;
  background: ${Style.color.bg.second};
  border-radius: 8px 8px 0px 0px;
  font-size: 16px;
  color: ${Style.color.label.primary};
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
        options.map(option =>
          <TabChoice
            key={option.value}
            className={ choosed === option.value ? 'tab-choosed' : '' }
            onClick={() => {
              setChoosed(option.value);

              if (choosed !== option.value) {
                onChange(option.value);
              }
            }}
          >{ option.name }</TabChoice>
        )
      }
    </TabChoices>
  );
};