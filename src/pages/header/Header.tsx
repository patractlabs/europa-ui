import React, { FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import LogoSVG from '../../assets/imgs/Europa.svg';
import CloseSVG from '../../assets/imgs/close.svg';
import MoreSVG from '../../assets/imgs/more-option.svg';
import SearchSVG from '../../assets/imgs/search.svg';
import ExplorerSVG from '../../assets/imgs/explorer.svg';
import AccountsSVG from '../../assets/imgs/accounts.svg';
import ForwardPNG from '../../assets/imgs/forward.png';
import BlocksSVG from '../../assets/imgs/blocks.svg';
import ExtrinsicsSVG from '../../assets/imgs/extrinsics.svg';
import EventsSVG from '../../assets/imgs/events-menu.svg';
import ContractsSVG from '../../assets/imgs/contracts.svg';
import DeveloperSVG from '../../assets/imgs/developer.svg';
import SettingSVG from '../../assets/imgs/setting.svg';
import { BreadCrumb, Divide, notification } from '../../shared';
import { Style } from '../../shared';
import { ApiContext, BlocksContext, ExtendedExtrinsic, useContracts, useAbi } from '../../core';
import { ActiveTab as ContractActiveTab } from '../contract';
import { ActiveTab as ExtrinsicActiveTab } from '../extrinsic/DetailPage';
import { ActiveTab as DeveloperActiveTab } from '../developer/Developer';
import { isBlockNumber } from '../blocks/BlockDetail';
import NaviBack from './NaviBack';
import NaviForward from './NaviForward';
import type { History } from 'history';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);

  > .sider-bg {
    z-index: 100;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    transition: opacity 0.3s; 
    background-color: rgb(0, 0, 0);
    opacity: 0;
  }

  > .sider {
    z-index: 101;
    color: white;
    background: linear-gradient(180deg, ${Style.color.label.primary} 0%, #555356 100%);
    position: absolute;
    width: 240px;
    left: -240px;
    top: 0px;
    transition: left 0.3s;
    bottom: 0px;
    padding: 16px 0px;

    > .sider-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0px 24px;
      margin-bottom: 56px;

      > div {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: bold;
        line-height: 24px;
      }
      > div img {
        margin-right: 12px;
        width: 36px;
        height: 36px;
      }
      > img {
        cursor: pointer;
      }
    }

    > .tabs {
      padding: 0px 24px;

      > .tab {
        display: flex;
        height: 24px;
        margin: 14px 0px;

        > img {
          vertical-align: middle;
          margin-right: 20px;
        }
        > a {
          vertical-align: middle;
          font-size: 16px;
          color: white;
        }
      }
    }

    > .tab-slice {
      height: 1px;
      margin: 30px 0px;
      background-color: gray;
    }
  }

  > .header-left {
    display: flex;
    align-items: center;

    > .more {
      width: 68px;
      height: 68px;
      background: linear-gradient(180deg, ${Style.color.label.primary} 0%, #555356 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      > img {
        width: 20px;
        cursor: pointer;
        height: 20px;
      }
    }

    > .navi {
      margin-right: 20px;
      display: flex;

      > div {
        cursor: pointer;
        width: 68px;
        height: 68px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${Style.color.bg.fourth};
        :hover {
          background-color: ${Style.color.bg.third};
        }

        > div {
          display: flex;
          cursor: pointer;
          height: 20px;
          width: 20px;
          border-radius: 5px;
        }
        /* > div:hover {
          background-color: white;
          svg polygon {
            fill: ${Style.color.primary};
          }
        }
        > div:active {
          background-color: ${Style.color.bg.second};
          svg rect {
            stroke: ${Style.color.bg.second};
          }
        } */
      }
      > div:first-child {
        margin-right: 1px;
      }
    }
  }

  > .header-right {
    > .search {
      position: relative;
      margin-right: 20px;
      height: 36px;

      > input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: #FFFFFF;
        opacity: 0.7;
      }
      > input {
        background-color: rgba(0,0,0,0);
        width: 300px;
        height: 100%;
        border-radius: 22px;
        border: 1px solid #FFFFFF;
        outline: none;
        padding: 10px 50px 10px 16px;
        font-size: 14px;
        color: #FFFFFF;
        line-height: 16px;
      }
      > img {
        cursor: pointer;
        width: 24px;
        height: 24px;
        position: absolute;
        right: 16px;
        top: 6px;
      }
    }
  }
`;

interface TabStructure {
  img: any;
  title: string;
  link: string;
}
const TabGroupOne: TabStructure[] = [
  {
    img: ContractsSVG,
    title: 'Contracts',
    link: '/contract',
  },
  {
    img: ExplorerSVG,
    title: 'Explorer',
    link: '/explorer',
  },
  {
    img: AccountsSVG,
    title: 'Accounts',
    link: '/account',
  },
  {
    img: BlocksSVG,
    title: 'Blocks',
    link: '/block',
  },
  {
    img: ExtrinsicsSVG,
    title: 'Extrinsics',
    link: '/extrinsic',
  },
  {
    img: EventsSVG,
    title: 'Events',
    link: '/event',
  },
  {
    img: DeveloperSVG,
    title: 'Developer',
    link: '/developer',
  }
];

const TabGroupTwo: TabStructure[] = [
  {
    img: SettingSVG,
    title: 'Setting',
    link: '/setting',
  }
];

const hashReg = '(.+)';
const addressReg = '(.+)';

export const Header: FC = (): ReactElement => {
  const [ showSider, toggoleSider ] = useState<boolean>(false);
  const [ showSiderBg, toggoleSiderBg ] = useState<boolean>(false);
  const [ divides, setDivides ] = useState<Divide[]>([]);
  const { pathname } = useLocation<{from: string}>();
  const [ search, setSearch ] = useState('');
  const [ contractAddress, setContractAddress ] = useState<string>();
  const [ codeHash, setCodeHash ] = useState<string>();
  const { blocks } = useContext(BlocksContext);
  const { api } = useContext(ApiContext);
  const { contracts } = useContracts(api, blocks);
  const h: History & { index: number } = useHistory() as any;

  const [ forwardEnabled, backwardEnabled ] = useMemo(
    () => ([h.length > h.index + 1, h.index > 1]),
    [h.index, h.length],
  );

  const contract = useMemo(
    () => contracts.find(contracts => contracts.address === contractAddress),
    [contracts, contractAddress],
  );
  const { name: contractName } = useAbi(contract?.codeHash || codeHash || '');

  const pathRegs: {
    reg: RegExp;
    divides: Divide[];
  }[] = useMemo(() => [
    {
      reg: new RegExp('^/explorer$'),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
      ],
    },
    {
      reg: new RegExp(`^/contract/codes/${hashReg}$`),
      divides: [
        {
          name: 'Contract',
          link: '/contract',
        },
        {
          name: 'Codes',
          link: '/contract/codes'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/contract/codes/${hashReg}$`);
            const result = reg.exec(pathname);
            const codeHash =  result ? `${result[1]}` : '';

            setCodeHash(codeHash);

            return  `${contractName || codeHash.slice(0, 7)}`;
          },
        },
      ],
    },
    {
      reg: new RegExp(`^/explorer/eoa/${addressReg}$`),
      divides: [
        {
          name: 'Explorer',
          link: '/explorer',
        },
        {
          name: 'EOA',
        },
      ],
    },
    {
      reg: new RegExp(`^/contract/instances/${addressReg}$`),
      divides: [
        {
          name: 'Contract',
          link: '/contract',
        },
        {
          name: 'Instances',
          link: '/contract/instances'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/contract/instances/${addressReg}$`);
            const result = reg.exec(pathname);
            const address =  result ? `${result[1]}` : '';

            setContractAddress(address);

            return  `${contractName || address.slice(0, 7)}`;
          },
        },
      ],
    },
    {
      reg: new RegExp(`^/block/${hashReg}$`),
      divides: [
        {
          name: 'Blocks',
          link: '/block',
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/block/(${hashReg})$`);
            const result = reg.exec(pathname);
            const blockHash =  result ? `${result[1]}` : '';
            const height = blocks.find(_block =>
              isBlockNumber(blockHash) ?
                _block.height === parseInt(blockHash) :
                _block.blockHash === blockHash
            )?.height;

            return  `#${height}`;
          },
        },
      ],
    },
    {
      reg: new RegExp('^/account$'),
      divides: [
        {
          name: 'Accounts',
        },
      ],
    },
    {
      reg: new RegExp('^/block$'),
      divides: [
        {
          name: 'Blocks',
        },
      ],
    },
    {
      reg: new RegExp('^/extrinsic$'),
      divides: [
        {
          name: 'Extrinsics',
        },
      ],
    },
    {
      reg: new RegExp(`^/extrinsic/${hashReg}/(.+)$`),
      divides: [
        {
          name: 'Extrinsic',
          link: '/extrinsic',
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/extrinsic/${hashReg}/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[2]}` : '';
            const map: { [key: string]: string } = {
              [ExtrinsicActiveTab.Details]: 'Details',
              [ExtrinsicActiveTab.Events]: 'Events',
              [ExtrinsicActiveTab.State]: 'State',
            }

            return  map[part] || '';
          },
        },
      ],
    },
    {
      reg: new RegExp('^/event$'),
      divides: [
        {
          name: 'Events',
        },
      ],
    },
    {
      reg: new RegExp('^/contract/(.+)$'),
      divides: [
        {
          name: 'Contracts',
          link: '/contract'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/contract/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[1]}` : '';
            const map: { [key: string]: string } = {
              [ContractActiveTab.Codes]: 'Codes',
              [ContractActiveTab.Instances]: 'Instances'
            }

            return  map[part] || '';
          },
        }
      ],
    },
    {
      reg: new RegExp('^/developer/(.+)$'),
      divides: [
        {
          name: 'Developer',
          link: '/developer'
        },
        {
          name: (pathname) => {
            const reg = new RegExp(`^/developer/(.+)$`);
            const result = reg.exec(pathname);
            const part =  result ? `${result[1]}` : '';
            const map: { [key: string]: string } = {
              [DeveloperActiveTab.ChainState]: 'Chain State',
              [DeveloperActiveTab.Extrinsic]: 'Extrinsic',
              [DeveloperActiveTab.RpcCall]: 'Rpc Call',
              [DeveloperActiveTab.Log]: 'Log',
            }

            return  map[part] || '';
          },
        }
      ],
    },
    {
      reg: new RegExp('^/setting$'),
      divides: [
        {
          name: 'Setting',
        },
      ],
    },
  ], [blocks, contractName]);

  const onSearch = useCallback(() => {
    if (!search) {
      return;
    }

    const block = blocks.find(block => block.blockHash === search);

    if (block) {
      setSearch('');
      return h.push(`/block/${block.blockHash}`);
    }

    const extrinsic = blocks
      .reduce((all: ExtendedExtrinsic[], block) => all.concat(block.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === search)

    if (extrinsic) {
      setSearch('');
      return h.push(`/extrinsic/${extrinsic.hash.toString()}/details`);
    }
    
    notification.warning({
      message: 'Nothing found',
      description: 'No item found',
    });
  }, [blocks, search, h]);

  useMemo(() => {
    setDivides(pathRegs.find(reg => reg.reg.test(pathname))?.divides || []);
  }, [setDivides, pathname, pathRegs]);

  useEffect(() => {
    if (showSider) {
      toggoleSiderBg(true);
      return;
    }
    const timer = setTimeout(() => {
      toggoleSiderBg(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [showSider]);

  const onToggle = (): void => {
    document.body.style.overflow = showSider ? 'initial' : 'hidden';
    toggoleSider(show => !show);
  };

  return (
    <Wrapper>
      <div className="sider-bg" onClick={onToggle} style={{ opacity: showSider ? 0.6 : 0, display: showSiderBg ? 'block' : 'none' }}/>
      <div className="sider" style={{ left: showSider ? '0px' : '-240px' }}>
        <div className="sider-header">
          <div>
            <img src={LogoSVG} alt='' />
            <span>Europa</span>
          </div>
          <img src={CloseSVG} alt='' onClick={onToggle} />
        </div>
        <div className="tabs">
          {
            TabGroupOne.map(tab => (
              <div className="tab" key={tab.title}>
                <img src={tab.img} alt="" />
                <Link to={tab.link} onClick={onToggle}>
                  {tab.title}
                </Link>
              </div>
            ))
          }
        </div>
        <div className="tab-slice" />
        <div className="tabs">
          {
            TabGroupTwo.map(tab => (
              <div className="tab" key={tab.title}>
                <img src={tab.img} alt="" />
                <Link to={tab.link} onClick={onToggle}>
                  {tab.title}
                </Link>
              </div>
            ))
          }
        </div>
      </div>
      <div className="header-left">
        <div className="more">
          <img src={MoreSVG} alt="" onClick={onToggle} />
        </div>
        <div className="navi">
          <div onClick={() => backwardEnabled && h.goBack()}>
            <div>
              {
                backwardEnabled ? 
                  <NaviBack /> :
                  <img style={{ transform: 'scaleX(-1)' }} src={ForwardPNG} alt="" />
              }
            </div>
          </div>
          <div onClick={() => forwardEnabled && h.goForward()}>
            <div>
              {
                forwardEnabled ?
                  <NaviForward /> :
                  <img src={ForwardPNG} alt="" />
              }
            </div>
          </div>
        </div>
        <BreadCrumb divides={divides} />
      </div>
      <div className="header-right">
        <div className="search">
          <input placeholder="Search by Txn hash/Block" onKeyDown={e => e.key === 'Enter' && onSearch()} value={search} onChange={e => setSearch(e.target.value)} />
          <img onClick={onSearch} src={SearchSVG} alt="" />
        </div>
      </div>
    </Wrapper>
  );
};
