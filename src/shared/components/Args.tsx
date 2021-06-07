import { FC, CSSProperties, ReactElement } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';

const Wrapper = styled.div`
`;

const Item = styled.div<{ hasChild: boolean }>`
  display: flex;

  > .key {
    padding: 20px;
    border: 1px solid ${Style.color.border.default};
    width: 140px;
    display: flex;
    align-items: center;
  }
  > .value {
    padding: ${props => props.hasChild ? '0px' : '20px'};
    border: 1px solid ${Style.color.border.default};
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

const Arg: FC<{ style?: CSSProperties; arg: Obj; index: number; }> = ({ arg, style, index }): ReactElement => {
  return (
    <div style={style}>
      {
        arg instanceof Array ? 
          <Item hasChild={true}>
            <div className="key">{index}</div>
            <div className="value">{
              <Args args={arg} />
            }</div>
          </Item>
          :
          isComplexed(arg) ?
            Object.keys(arg).map(key =>
              <Item key={key} hasChild={isComplexed(arg[key])}>
                <div className="key">{key}</div>
                <div className="value">{
                  isComplexed(arg[key]) ? <Args args={arg[key] as Obj} /> : <span>{`${arg[key]}`}</span>
                }</div>
              </Item>
            )
            :
            <Item hasChild={false}>
              <div className="key">{index}</div>
              <div className="value">{
                <span>{`${arg}`}</span>
              }</div>
            </Item>

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
          <div key={index}>
            <Arg arg={arg} index={index} />
          </div>
        )
      }
    </Wrapper>
  );
};