import { FC, CSSProperties, ReactElement } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';

const Wrapper = styled.div`
`;

const Item = styled.div`
  display: flex;

  > .key {
    padding: 20px;
    border: 1px solid ${Style.color.border.default};
    width: 140px;
    height: 100%;
    line-height: 100%;
  }
  > .value {
    border: 1px solid ${Style.color.border.default};
    padding: 20px;
    overflow: hidden;
    flex: 1;
    line-height: 100%;
  }
`;

export interface Obj {
  [key: string]: string | number | boolean | null | Obj[] | Obj;
}

const isComplexed = (value: any): boolean => {
  return typeof value === 'object' && value !== null;
};

const Arg: FC<{ style?: CSSProperties, arg: Obj }> = ({ arg, style }): ReactElement => {
  return (
    <div style={style}>
      {
        Object.keys(arg).map(key =>
          <Item key={key}>
            <div className="key">{key}</div>
            <div className="value">{
              isComplexed(arg[key]) ? <Args args={arg[key] as Obj} /> : <span>{arg[key]}</span>
            }</div>
          </Item>
        )
      }
    </div>
  );
};

export const Args: FC<{ args: Obj[] | Obj }> = ({ args }): ReactElement => {
  args = args instanceof Array ?
    args :
    Object.keys(args).map(key =>
      ({
        [key]: (args as Obj)[key]
      })
    );

  return (
    <Wrapper>
      {
        args.map((arg, index) =>
          <Arg style={{  }} key={index} arg={arg} />
        )
      }
    </Wrapper>
  );
};