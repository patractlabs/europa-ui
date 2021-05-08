export const formatAddress = (address: string, len = 15) => {
  if (!address || address.length < len) {
    return address;
  }
  return `${address.slice(0, len - 3)}...`;
};