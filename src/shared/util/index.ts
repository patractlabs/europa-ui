import { Block, Extrinsic } from '../../core/provider/blocks.provider';

export const formatAddress = (address: string, len = 15) => {
  if (!address || address.length < len) {
    return address;
  }
  return `${address.slice(0, len - 3)}...`;
};

export const lookForDestAddress = (extrinsic: Extrinsic): string => {
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
  } catch (e) { }

  return '';
};

export const lookForTranferedValue = (extrinsic: Extrinsic): string => {
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
  } catch (e) { }

  return '-';
};

export const getBlockTimestamp = (block: Block): number => {
  const setTimeExtrinsic = block.extrinsics.find(extrinsic =>
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

export const formatBlockTimestamp = (block: Block): string => {
  const timestamp = getBlockTimestamp(block);

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
  console.log('t', timestamp)
  const date = new Date(timestamp);
  return `${formatUnit(date.getHours())}:${formatUnit(date.getMinutes())}:${formatUnit(date.getSeconds())} ${formatUnit(date.getMonth() + 1)}-${formatUnit(date.getDate())}-${formatUnit(date.getFullYear())}`;
}

export * from './require';