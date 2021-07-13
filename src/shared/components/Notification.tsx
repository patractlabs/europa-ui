import { notification as antNotification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import SuccessSvg from '../../assets/imgs/success.svg';
import CompletedSvg from '../../assets/imgs/completed.svg';
import WarningSvg from '../../assets/imgs/warning.svg';
import FailSvg from '../../assets/imgs/fail.svg';

export const notification = {
  success(args: ArgsProps) {
    antNotification.success({
      icon: <img src={SuccessSvg} alt="" />,
      ...args,
    });
  },
  completed (args: ArgsProps) {
    antNotification.info({
      icon: <img src={CompletedSvg} alt="" />,
      ...args,
    });
  },
  warning (args: ArgsProps) {
    antNotification.warning({
      icon: <img src={WarningSvg} alt="" />,
      ...args,
    });
  },
  fail (args: ArgsProps) {
    antNotification.error({
      icon: <img src={FailSvg} alt="" />,
      ...args,
    });
  },
};