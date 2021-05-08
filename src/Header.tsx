import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LogoSVG from './assets/imgs/Europa.svg';
import CloseSVG from './assets/imgs/close.svg';
import MoreSVG from './assets/imgs/more-option.svg';
import SearchSVG from './assets/imgs/more-option.svg';
import { BreadCrumb, Divide } from './BreadCrumb';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  background: linear-gradient(90deg, #BEAC92 0%, #B19E83 100%);
`;
const HeaderLeft = styled.div`
  display: flex;
`;

const More = styled.div`
  width: 68px;
  height: 68px;
  margin-right: 20px;
  background: linear-gradient(180deg, #2A292B 0%, #555356 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: 20px;
    cursor: pointer;
    height: 20px;
  }
`;

const SiderBg = styled.div`
  z-index: 1;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  transition: opacity 0.3s; 
  background-color: rgb(0, 0, 0);
  opacity: 0;
`;

const Sider = styled.div`
  z-index: 2;
  color: white;
  background: linear-gradient(180deg, #2A292B 0%, #555356 100%);
  position: absolute;
  width: 240px;
  left: -240px;
  top: 0px;
  transition: left 0.3s;
  bottom: 0px;
  padding: 16px 0px;
`;
const SiderHeadr = styled.div`
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
`;
const Tabs = styled.ul`
  padding: 0px 24px;

`;
const Tab = styled.li`
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
`;

const TabSlice = styled.div`
  height: 1px;
  margin: 30px 0px;
  background-color: gray;
`;
const Search = styled.div`
  position: relative;
  margin-right: 20px;
  height: 36px;

  > input {
    background: linear-gradient(90deg, #BEAC92 0%, #B19E83 100%);
    width: 300px;
    height: 100%;
    border-radius: 22px;
    border: 1px solid #FFFFFF;
    outline: none;
    padding: 10px 16px;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 16px;
  }
  > img {
    width: 24px;
    height: 24px;
    position: absolute;
    right: 16px;
    top: 6px;
  }
`;

interface TabStructure {
  img: any;
  title: string;
  link: string;
}
const TabGroupOne: TabStructure[] = [
  {
    img: MoreSVG,
    title: 'Explorer',
    link: '/explorer',
  },
  {
    img: MoreSVG,
    title: 'Accounts',
    link: '/accounts',
  },
  {
    img: MoreSVG,
    title: 'Blocks',
    link: '/blocks',
  },
  {
    img: MoreSVG,
    title: 'Extrinsics',
    link: '/extrinsics',
  },
  {
    img: MoreSVG,
    title: 'Events',
    link: '/events',
  },
  {
    img: MoreSVG,
    title: 'Contracts',
    link: '/contracts',
  },
  {
    img: MoreSVG,
    title: 'Developer',
    link: '/developer',
  }
];

const TabGroupTwo: TabStructure[] = [
  {
    img: MoreSVG,
    title: 'Setting',
    link: '/setting',
  }
];

export const Header: FC = (): ReactElement => {
  const [ showSider, toggoleSider ] = useState<boolean>(false);
  const [ showSiderBg, toggoleSiderBg ] = useState<boolean>(false);
  const [ divides, setDivides ] = useState<Divide[]>([]);

  const onTabClicked = useCallback((tab: TabStructure) => {
    console.log('choosed tab', tab, [
      {
        name: tab.title,
        path: tab.link[0] === '/' ? tab.link.slice(1) : tab.link,
      }
    ]);
    setDivides([
      {
        name: tab.title,
        path: tab.link[0] === '/' ? tab.link.slice(1) : tab.link,
      }
    ]);
    toggoleSider(false);
  }, []);

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

  return (
  <Wrapper>
    {
      <SiderBg onClick={() => toggoleSider(false)} style={{ opacity: showSider ? 0.6 : 0, display: showSiderBg ? 'block' : 'none' }}/>
    }
    <Sider style={{ left: showSider ? '0px' : '-240px' }}>
      <SiderHeadr>
        <div>
          <img src={LogoSVG} alt='' />
          <span>Europa</span>
        </div>
        <img src={CloseSVG} alt='' onClick={() => toggoleSider(false)} />
      </SiderHeadr>
      <Tabs>
        {
          TabGroupOne.map(tab => (
            <Tab key={tab.title}>
              <img src={tab.img} alt="" />
              <Link to={tab.link} onClick={() => onTabClicked(tab)}>
                {tab.title}
              </Link>
            </Tab>
          ))
        }
      </Tabs>
      <TabSlice />
      <Tabs>
        {
          TabGroupTwo.map(tab => (
            <Tab key={tab.title}>
              <img src={tab.img} alt="" />
              <Link to={tab.link} onClick={() => onTabClicked(tab)}>
                {tab.title}
              </Link>
            </Tab>
          ))
        }
      </Tabs>
    </Sider>
    <HeaderLeft>
      <More>
        <img src={MoreSVG} alt="" onClick={() => toggoleSider(true)} />
      </More>
      <BreadCrumb divides={divides} />
    </HeaderLeft>
    <Search>
      <input />
      <img src={SearchSVG} alt="" />
    </Search>
  </Wrapper>
  );
};
