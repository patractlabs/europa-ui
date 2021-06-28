import type { I18nProps } from '../react-components/types';
import type { Registry, TypeDef } from '@polkadot/types/types';
import type { ComponentMap, ParamDef, RawParam, RawParamOnChangeValue, RawParams } from './types';

import React, { useMemo } from 'react';

import { api } from '../core';
import ErrorBoundary from '../react-components/ErrorBoundary';

import Holder from './Holder';
import ParamComp from './ParamComp';
import translate from './translate';
import { createValue } from './values';
import styled from 'styled-components';
import { Style } from '../shared';
import { isUndefined } from 'util';
import { encodeTypeDef } from '@polkadot/types';

const Wrapper = styled.div`
  > .param {
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
    padding-bottom: 8px;
  }
`;

interface Props extends I18nProps {
  children?: React.ReactNode;
  isDisabled?: boolean;
  onChange?: (value: RawParams) => void;
  onEnter?: () => void;
  onError?: () => void;
  onEscape?: () => void;
  overrides?: ComponentMap;
  params: ParamDef[];
  registry?: Registry;
  values?: RawParams | null;
  withBorder?: boolean;
  isRoot?: boolean;

}

interface State {
  params?: ParamDef[] | null;
  values?: RawParams;
}

export { Holder };

class Params extends React.PureComponent<Props, State> {
  public state: State = {
    params: null
  };

  public static getDerivedStateFromProps ({ isDisabled, params, registry = api.registry, values }: Props, prevState: State): Pick<State, never> | null {
    const isSame = JSON.stringify(prevState.params) === JSON.stringify(params);

    if (isDisabled || isSame) {
      return null;
    }

    return {
      params,
      values: params.reduce(
        (result: RawParams, param, index): RawParams => [
          ...result,
          values && values[index]
            ? values[index]
            : createValue(registry, param)
        ],
        []
      )
    };
  }

  // Fire the initial onChange (we did update) when the component is loaded
  public componentDidMount (): void {
    this.componentDidUpdate(null, {});
  }

  // This is needed in the case where the item changes, i.e. the values get
  // initialized and we need to alert the parent that we have new values
  public componentDidUpdate (_: Props | null, prevState: State): void {
    const { isDisabled } = this.props;
    const { values } = this.state;

    if (!isDisabled && JSON.stringify(prevState.values) !== JSON.stringify(values)) {
      this.triggerUpdate();
    }
  }

  private getName (name: string | undefined, type: TypeDef) {
    return isUndefined(name)
      ? encodeTypeDef(type).split(':')[0]
      : name;
  }

  private getType (name: string | undefined, type: TypeDef) {
    return isUndefined(name)
      ? encodeTypeDef(type).split(':')[1]
      : encodeTypeDef(type);
  }
  public render (): React.ReactNode {
    const { isRoot, children, className = '', isDisabled, onEnter, onEscape, overrides, params, registry = api.registry, withBorder = true } = this.props;
    const { values = this.props.values } = this.state;


    
    if (!values || !values.length) {
      return null;
    }

    return (
      <Holder
        style={{ borderLeftWidth: isRoot ? '0px' : '0.25rem' }}
        className={className}
        withBorder={withBorder}
      >
        <ErrorBoundary onError={this.onRenderError}>
          <div className='ui--Params-Content' style={{ paddingLeft: isRoot ? '0px' : '1.75rem' }}>
            {values && params.map(({ name, type }: ParamDef, index: number): React.ReactNode => (
              <Wrapper key={`${name || ''}:${type.toString()}:${index}`} className="param-input">
                <div className="param">
                  {this.getName(name, type)} : {this.getType(name, type)}
                </div>
                <ParamComp
                  defaultValue={values[index]}
                  index={index}
                  isDisabled={isDisabled}
                  name={name}
                  onChange={this.onChangeParam}
                  onEnter={onEnter}
                  onEscape={onEscape}
                  overrides={overrides}
                  registry={registry}
                  type={type}
                />
              </Wrapper>
            ))}
            {children}
          </div>
        </ErrorBoundary>
      </Holder>
    );
  }

  private onChangeParam = (index: number, newValue: RawParamOnChangeValue): void => {
    const { isDisabled } = this.props;

    if (isDisabled) {
      return;
    }

    const { isValid = false, value } = newValue;

    this.setState(
      (prevState: State): Pick<State, never> => ({
        values: (prevState.values || []).map((prev, prevIndex): RawParam =>
          prevIndex !== index
            ? prev
            : { isValid, value }
        )
      }),
      this.triggerUpdate
    );
  }

  private triggerUpdate = (): void => {
    const { isDisabled, onChange } = this.props;
    const { values } = this.state;

    if (isDisabled || !values) {
      return;
    }

    onChange && onChange(values);
  }

  private onRenderError = (): void => {
    const { onError } = this.props;

    onError && onError();
  }
}

export default translate(Params);
