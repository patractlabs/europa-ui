import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../styled/const';
import { Args, Obj } from './Args';
import { ApiContext, DeployedContract, useAbi, ExtendedEventRecord } from '../../core';
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
    > .contract-emit {
      border: 1px solid ${Style.color.border.default};
      padding: 16px;
      background-color: white;
      margin-top: 16px;

      > h6 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }
    }
  }
`;

const decodeData = (abi: Abi, data: Codec): { identifier: string; args: Obj[] } | undefined => {
  try {
    const event = abi.decodeEvent(data.toU8a(true));

    return {
      identifier: event.event.identifier,
      args: event.args.map((arg, index) => ({
        [event.event.args[index].name]: arg.toJSON()
      })) as unknown as Obj[]
    };

  } catch (e) {}

  return;
};

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

export const Event: FC<{ contracts: DeployedContract[]; event: ExtendedEventRecord, showIndex?: boolean }> = ({ contracts, event, showIndex = false }): ReactElement => {
  const { metadata } = useContext(ApiContext);
  const [ expanded, setExpanded ] = useState(false);
  const [ contractAddress, setContractAddress ] = useState<string>();
  const [ args, setArgs ] = useState<Obj[]>([]);
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
    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}

    const eventArgNames = modules.find(module => module.name.toLowerCase() === event.event.section.toLowerCase())?.events
      .find(_event => _event.name.toLowerCase() === event.event.method.toLowerCase())?.args || [];
    const errIndex = eventArgNames.findIndex(name => name === 'DispatchError');
    const isContractEmit = event.event.section.toLowerCase() === 'contracts'
      && event.event.method.toLowerCase() === 'contractemitted';
    
    if (errIndex >= 0) {
      const err = event.event.data[errIndex].toJSON() as {
        module?: {
          index: number;
          error: number;
        }
      };

      if (err.module) {
        setErr({
          section: modules[err.module.index].name,
          err: modules[err.module.index].errors[err.module.error],
        });        
      }
    }

    if (isContractEmit) {
      setContractAddress(event.event.data[0].toString());
    }

    const args = event.event.data.map((value, index) => {
      return {
        [eventArgNames[index] ? eventArgNames[index] : `${index}`]: value.toHuman(),
      } as unknown as Obj;
    });

    setArgs(args);
  }, [metadata, event]);

  const contractArgs: { identifier: string; args: Obj[] } | undefined = useMemo(() => {
    const isContractEmit = event.event.section.toLowerCase() === 'contracts'
      && event.event.method.toLowerCase() === 'contractemitted';

    if (!abi || !isContractEmit) {
      return;
    }

    return decodeData(abi, event.event.data[1]);
  }, [abi, event]);

  return (
    <Wrapper>
      <div className="info-line" onClick={() => setExpanded(!expanded)}>
        <div className="event-name">{event.event.section.toString()}.{event.event.method.toString()}</div>
        {
          showIndex &&
            <div className="index">{event.blockHeight} - {event.phase.asApplyExtrinsic.toNumber()}</div>
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
            {
              !!contractArgs &&
                <div className="contract-emit">
                  <h6>Event: {contractArgs.identifier}</h6>
                  <Args args={contractArgs.args} borderColor={Style.color.border.default} />
                </div>
            }
          </div>
      }
    </Wrapper>
  );
};