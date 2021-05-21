import { SubmittableResult } from '@polkadot/api';
export type QueueTxStatus = 'future' | 'ready' | 'finalized' | 'finalitytimeout' | 'usurped' | 'dropped' | 'inblock' | 'invalid' | 'broadcast' | 'cancelled' | 'completed' | 'error' | 'incomplete' | 'queued' | 'qr' | 'retracted' | 'sending' | 'signing' | 'sent' | 'blocked';

type NOOP = (r: SubmittableResult) => void;

export function handleTxResults (
  // queueSetTxStatus: QueueTxMessageSetStatus,
  {
    fail: txFailedCb = () => undefined,
    success: txSuccessCb = () => undefined,
    update: txUpdateCb = () => undefined,
  }: {
    fail?: NOOP;
    success?: NOOP;
    update?: NOOP;
  },
  unsubscribe: () => void,
): (result: SubmittableResult) => void {
  return (result: SubmittableResult): void => {
    if (!result || !result.status) {
      return;
    }

    const status = result.status.type.toLowerCase() as QueueTxStatus;

    console.log(`sendAsync: status :: ${status}`);

    // queueSetTxStatus(id, status, result);
    // txUpdateCb(result);

    if (result.status.isFinalized || result.status.isInBlock) {
      result.events
        .filter(({ event: { section } }) => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicFailed') {
            txFailedCb(result);
          } else if (method === 'ExtrinsicSuccess') {
            txSuccessCb(result);
          }
        });
    } else if (result.isError) {
      txFailedCb(result);
    }

    if (result.isCompleted) {
      unsubscribe();
    }
  };
}
