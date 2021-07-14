import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../styled/const';
import { Args, Obj } from './Args';
import { ApiContext, DeployedContract, useAbi } from '../../core';
import { Abi } from '@polkadot/api-contract';
import { Codec } from '@polkadot/types/types';

const Wrapper = styled.div`
  border-bottom: 1px solid ${Style.color.border.default};

  > .info-line {
    cursor: pointer;
    display: flex;
    height: 50px;
    justify-content: space-between;
    align-items: center;
    padding: 0px 20px;
    color: ${Style.color.label.primary};

    > .event-name {
      width: 50%;
      font-weight: 600;
    }
    > .index {
      width: 30%;
    }
    > .togglo-detail {
      width: 20%;
      user-select: none;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      
      > span {
        color: ${Style.color.primary};
        margin-right: 4px;
      }
    }
  }
  > .detail {
    background: ${Style.color.bg.second};
    padding: 20px 21px;

    > .error {
      border: 1px solid ${Style.color.border.error};
      padding: 16px;
      background-color: ${Style.color.bg.error};
      margin-top: 16px;

      > h6 {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
`;

export interface ExtendedEventRecord extends EventRecord {
  blockHeight?: number;
  indexInBlock?: number;
};

const decodeData = (event: EventRecord, abi: Abi | undefined, name: string, data: Codec): string | Obj[] => {
  const isContractEmit = event.event.section.toLowerCase() === 'contracts'
    && event.event.method.toLowerCase() === 'contractemitted';

  if (!abi || name !== 'Bytes' || !isContractEmit) {
    return data.toString();
  }

  try {
    const event = abi.decodeEvent(data.toU8a(true));

    console.log('event.args', event.args);

    return [
      { event: event.event.identifier },
      {
        parameters: event.args.map((arg, index) => ({
          [event.event.args[index].name]: arg.toJSON()
        }))
      },
    ] as unknown as Obj[];

  } catch (e) {}

  return data.toString();
};

export const Event: FC<{ contracts: DeployedContract[]; event: ExtendedEventRecord, showIndex?: boolean }> = ({ contracts, event, showIndex = false }): ReactElement => {
  const { metadata } = useContext(ApiContext);
  const [ expanded, setExpanded ] = useState(false);
  const [ args, setArgs ] = useState<Obj[]>([]);
  const [ contractAddress, setContractAddress ] = useState<string>();
  const codeHash = useMemo(
    () => contracts.find(contract => contract.address === contractAddress)?.codeHash,
    [contractAddress, contracts],
  );
  const { abi } = useAbi(codeHash || '');
  
  const [ err, setErr ] = useState<{
    section: string;
    err: {
      name: string,
      documentation: string[],
    } 
  }>();


  useEffect(() => {
    type Module = {
      name: string;
      events: {
        name: string;
        args: string[];
        documantion: string;
      }[];
      errors: {
        name: string,
        documentation: string[],
      }[];
    };

    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}


    const contractArgs = modules.find(module => module.name.toLowerCase() === event.event.section.toLowerCase())?.events
      .find(_event => _event.name.toLowerCase() === event.event.method.toLowerCase())?.args || [];
    const errIndex = contractArgs.findIndex(arg => arg === 'DispatchError');
    const isContractEmit = event.event.section.toLowerCase() === 'contracts'
      && event.event.method.toLowerCase() === 'contractemitted';

    const args = event.event.data.map((value, index) => {
      if (errIndex === index) {
        const err = value.toJSON() as {
          module: {
            index: number;
            error: number;
          }
        };

        setErr({
          section: modules[err.module.index].name,
          err: modules[err.module.index].errors[err.module.error],
        });        
      }

      if (isContractEmit) {
        if (index === 0) {
          setContractAddress(value.toString());
        }
      }

      return {
        [contractArgs[index] ? contractArgs[index] : `${index}`]: decodeData(event, abi, contractArgs[index], value),
      } as unknown as Obj;
    });

    console.log('args', args)
    setArgs(args);
  }, [metadata, event, abi]);

  return (
    <Wrapper>
      <div className="info-line" onClick={() => setExpanded(!expanded)}>
        <div className="event-name">{event.event.section.toString()}.{event.event.method.toString()}</div>
        {
          showIndex &&
            <div className="index">{event.blockHeight} - {event.indexInBlock}</div>
        }
        <div className="togglo-detail">
          <span>
            Details
          </span>
          <img src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
        </div>
      </div>
      {
        expanded &&
          <div className="detail">
            <Args args={args} />
            {
              !!err &&
                <div className="error">
                  <h6>
                    {err?.section}.{err?.err.name}
                  </h6>
                  <p>
                    {
                      err?.err.documentation.join(' ')
                    }
                  </p>
                </div>
            }
          </div>
      }
    </Wrapper>
  );
};