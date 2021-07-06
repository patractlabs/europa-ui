import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { message, } from 'antd';
import styled from 'styled-components';
import { take, filter } from 'rxjs/operators';
import { BusContext, EuropaManageContext, SettingContext } from '../../core';
import Logo from '../../assets/imgs/logo.png';
import { useHistory } from 'react-router-dom';
import EuropaSetting from '../setting/EuropaSetting';
import { Style } from '../../shared';
import * as _ from 'lodash';

const StartUp: FC<{ className: string }> = ({ className }): ReactElement => {
  const { update, setting } = useContext(SettingContext);
  const { startup } = useContext(EuropaManageContext);
  const { connected$ } = useContext(BusContext);
  const [ loading, setLoading ] = useState<boolean>(false);
  const history = useHistory();

  const onStart = useCallback((dbPath: string, workspace: string, httpPort: number | undefined, wsPort: number | undefined) => {
    setLoading(true)

    const newSetting = _.cloneDeep(setting);
    const db = newSetting.databases.find(db => db.path === dbPath)
    
    !db?.workspaces.includes(workspace) && db?.workspaces.push(workspace);
    newSetting.lastChoosed = {
      database: dbPath,
      workspace,
    };
    update(newSetting);

    startup(dbPath, workspace).then(europa => {
      europa?.once('close', (code, signal) => {
        console.log('code', code, signal, typeof code);

        if (!!code) {
          setLoading(false);
          message.error(`Europa exited unexpectly`, 3);
        }
      });
      connected$.pipe(
        filter(c => !!c),
        take(1),
      ).subscribe(() => {
        console.log('history.push(explorer);');
        setLoading(false);
        history.push('/explorer');
      });
    }, err => {
      console.log(err);
      setLoading(false);
      message.error('Failed to start europa', 1);
    });
  }, [setting, update, history, startup, connected$]);

  return (
    <div className={className}>
      <div className="content">
        <div className="title">
          <img src={Logo} alt="" />
          <h1>Europa is Ready!</h1>
        </div>
        <div className="setting">
          <EuropaSetting type="Start" onSubmit={onStart} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(styled(StartUp)`
  height: 100%;
  background-color: ${Style.color.bg.default};
  padding: 20px;

  > .content {
    padding: 36px;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;

    > .title {
      height: 60px;
      display: flex;
      align-items: center;
      width: 50%;
      max-width: 540px;
      margin-bottom: 40px;
      position: relative;
      justify-content: center;

      > img {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 60px;
        height: 60px;
      }
      > h1 {

      }
    }
    > .setting {
      width: 50%;
      max-width: 540px;
    }
  }
`);