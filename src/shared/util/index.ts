import { ExtendedBlock } from '../../core/provider/blocks.provider';
import type { GenericExtrinsic } from '@polkadot/types';
import type { AnyTuple } from '@polkadot/types/types';

export const formatAddress = (address: string, len = 15) => {
  if (!address || address.length < len) {
    return address;
  }
  return `${address.slice(0, len - 3)}...`;
};

export const lookForDestAddress = (extrinsic: GenericExtrinsic<AnyTuple>): string => {
  try {
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'transfer' || extrinsic.method.method === 'transferKeepAlive')
    ) {
      return (extrinsic.method.args[0].toHuman() as any).Id;
    }
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'forceTransfer')
    ) {
      return (extrinsic.method.args[1].toHuman() as any).Id;
    }
    if (extrinsic.method.section === 'contracts'
      && (extrinsic.method.method === 'call')
    ) {
      return (extrinsic.method.args[0].toHuman() as any).Id;
    }
  } catch (e) { }

  return '';
};

export const lookForTranferedValue = (extrinsic: GenericExtrinsic<AnyTuple>): string => {
  try {
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'transfer' || extrinsic.method.method === 'transferKeepAlive')
    ) {
      return extrinsic.method.args.map(a => a.toHuman())[1] as any;
    }
    if (extrinsic.method.section === 'balances'
      && (extrinsic.method.method === 'forceTransfer')
    ) {
      return extrinsic.method.args.map(a => a.toHuman())[2] as any;
    }
    if (extrinsic.method.section === 'contracts'
      && (extrinsic.method.method === 'call')
    ) {
      return (extrinsic.method.args[1].toHuman() as any);
    }
  } catch (e) { }

  return '-';
};

export const getBlockTimestamp = (extrinsics: GenericExtrinsic<AnyTuple>[]): number => {
  const setTimeExtrinsic = extrinsics.find(extrinsic =>
    extrinsic.method.section === 'timestamp' && extrinsic.method.method === 'set'
  );
  const timestamp = parseInt(setTimeExtrinsic?.method.args[0].toString() || '');

  return timestamp;
}

function formatUnit(t: number) {
  if (t === 0) {
    return '00';
  }
  if (t < 10) {
    return `0${t}`;
  }
  return `${t}`;
}

export const formatBlockTimestamp = (block: ExtendedBlock): string => {
  const timestamp = getBlockTimestamp(block.extrinsics);

  if (`${timestamp}` === 'NaN') {
    return '-';
  }
  console.log('t', timestamp)
  const date = new Date(timestamp);
  return `${formatUnit(date.getHours())}:${formatUnit(date.getMinutes())}:${formatUnit(date.getSeconds())} ${formatUnit(date.getMonth() + 1)}-${formatUnit(date.getDate())}-${formatUnit(date.getFullYear())}`;
}

export const formatTimestamp = (timestamp: number): string => {
  if (`${timestamp}` === 'NaN') {
    return '-';
  }

  const date = new Date(timestamp);

  return `${formatUnit(date.getHours())}:${formatUnit(date.getMinutes())}:${formatUnit(date.getSeconds())} ${formatUnit(date.getMonth() + 1)}-${formatUnit(date.getDate())}-${formatUnit(date.getFullYear())}`;
}

export * from './require';