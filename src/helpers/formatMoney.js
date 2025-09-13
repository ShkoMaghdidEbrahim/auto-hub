export const formatIQD = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return `${Number(value).toLocaleString()} IQD`;
};

export const formatUSD = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return `$${Number(value).toLocaleString()}`;
};
