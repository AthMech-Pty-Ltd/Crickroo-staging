export const cmToFtIn = (
  cm: number | undefined,
): { ft: string; in: string } => {
  if (cm === undefined || isNaN(cm) || cm === 0) return { ft: '', in: '' };
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 12) {
    return { ft: (ft + 1).toString(), in: '0' };
  }
  return { ft: ft.toString(), in: inches.toString() };
};

export const ftInToCm = (val: string | undefined): number => {
  if (!val) return 0;
  if (val.includes('-')) {
    const [ftStr, inStr] = val.split('-');
    const f = parseFloat(ftStr) || 0;
    const i = parseFloat(inStr) || 0;
    return (f * 12 + i) * 2.54;
  }
  const feet = parseFloat(val) || 0;
  return feet * 30.48;
};
