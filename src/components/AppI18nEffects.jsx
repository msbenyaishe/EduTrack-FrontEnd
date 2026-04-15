import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const AppI18nEffects = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.resolvedLanguage || "en";
    document.documentElement.lang = lang;
    // Keep layout direction fixed to LTR for all languages.
    document.documentElement.dir = "ltr";
  }, [i18n, i18n.resolvedLanguage]);

  return null;
};

export default AppI18nEffects;
