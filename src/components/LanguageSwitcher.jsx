import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = ({ compact = false, variant = "dropdown" }) => {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage || "en";
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const menuId = useId();

  const items = useMemo(
    () => [
      { id: "en", label: t("lang.en") },
      { id: "fr", label: t("lang.fr") },
      { id: "ar", label: t("lang.ar") },
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = (language || "en").toUpperCase();

  if (variant === "blocks") {
    return (
      <div className="lang-switcher lang-switcher--blocks" aria-label={t("common.language", { defaultValue: "Language" })}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`lang-block${language === it.id ? " is-active" : ""}`}
            onClick={() => i18n.changeLanguage(it.id)}
          >
            {it.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`lang-switcher${compact ? " lang-switcher--compact" : ""}${open ? " is-open" : ""}`}
    >
      <span className="sr-only">{t("common.language", { defaultValue: "Language" })}</span>

      <button
        type="button"
        className="lang-switcher__btn"
        ref={btnRef}
        aria-label={t("common.language", { defaultValue: "Language" })}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          // If focus moves outside, close (desktop keyboard).
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <Globe size={18} aria-hidden className="lang-switcher__icon" />
        <span className="lang-switcher__value">{label}</span>
      </button>

      <div id={menuId} className="lang-switcher__menu" role="menu">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            role="menuitemradio"
            aria-checked={language === it.id}
            className={`lang-switcher__item${language === it.id ? " is-active" : ""}`}
            onClick={() => {
              i18n.changeLanguage(it.id);
              setOpen(false);
            }}
          >
            <span className="lang-switcher__item-label">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
