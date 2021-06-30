import React, { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Style } from '../styled/const';
import TPng from '../../assets/imgs/side.png';

const PageTabs_: FC<{
  options: {
    tab: string;
    title: string;
    link: string;
  }[];
  className: string;
}> = ({ className, options }) => {
  const { part } = useParams<{ part: string }>();
  
  return (
    <div className={className}>
      {
        options.map(tab =>
          <div
            key={tab.tab}
            className={ tab.tab === part ? 'tab active-tab' : 'tab'}
          >
            <img src={TPng} alt="" />
            <div>
              <Link to={tab.link}>
                {tab.title} 
              </Link>
            </div>
            <img src={TPng} alt="" />
          </div>
        )
      }
    </div>
  );
};

export const PageTabs = React.memo(styled(PageTabs_)`
  padding: 0px 68px;
  display: flex;

  .tab {
    width: 133px;
    line-height: 40px;
    font-size: 16px;
    display: flex;
  
    > div {
      flex: 1;
      text-align: center;
  
      a {
        color: white; 
      }
    }
    > img {
      visibility: hidden;
    }
    > img:last-child {
      transform: rotateY(180deg);
    }
  }

  .active-tab {

    > img {
      visibility: visible;
    }
    > div {
      background-color: ${Style.color.bg.default};

      a {
        color: ${Style.color.primary};
      }
    }
  }

`);