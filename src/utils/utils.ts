export function legalFileName(fileName: string) {
  return !/[\[\]#^|\\/:]/.test(fileName);
}

export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toLocaleDateString();
}