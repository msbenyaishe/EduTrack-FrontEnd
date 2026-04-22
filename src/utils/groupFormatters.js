export const formatAcademicYear = (year) => {
  if (!year) return '';
  const startYear = parseInt(year, 10);
  if (isNaN(startYear)) return year;
  return `${startYear}–${startYear + 1}`;
};

export const formatGroupTitle = (name, year) => {
  const formattedYear = formatAcademicYear(year);
  if (!formattedYear) return name || '';
  return name ? `${name} (${formattedYear})` : formattedYear;
};
