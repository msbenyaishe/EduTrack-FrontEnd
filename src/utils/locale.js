export const getLocaleTag = (language) => {
  if (language === "fr") return "fr-FR";
  if (language === "ar") return "ar-EG-u-nu-latn";
  return "en-US";
};

export const formatDate = (value, language, options) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const finalOptions = options || {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formatted = new Intl.DateTimeFormat(getLocaleTag(language), finalOptions).format(date);
  // Bidi isolate keeps date order stable inside Arabic/LTR mixed text.
  return `\u2068${formatted}\u2069`;
};

export const formatAcademicYear = (year) => {
  if (!year || isNaN(year)) return year || '';
  return `${year}–${parseInt(year, 10) + 1}`;
};
