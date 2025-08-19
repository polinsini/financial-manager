export const formatDateForChart = (date: string): string => {
  try {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().slice(5, 10); // Returns MM-DD
  } catch {
    return date;
  }
};
