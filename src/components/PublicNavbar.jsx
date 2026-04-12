import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('public-nav-open');
    } else {
      document.body.classList.remove('public-nav-open');
    }
    return () => document.body.classList.remove('public-nav-open');
  }, [open]);

  const navLink = (isCta) =>
    function navLinkClass({ isActive }) {
      let c = 'public-nav__link';
      if (isCta) c += ' public-nav__cta';
      if (isActive) c += ' public-nav__link--active';
      return c;
    };

  const close = () => setOpen(false);

  return (
    <header className="public-nav">
      <div className="public-nav__inner">
        <Link to="/" className="public-nav__brand" onClick={close}>
          <span className="public-nav__logo-mark" aria-hidden>
            <BookOpen size={22} strokeWidth={2.25} />
          </span>
          <span className="public-nav__logo-text">EduTrack</span>
        </Link>

        <nav className="public-nav__desktop" aria-label="Primary">
          <NavLink to="/login" className={navLink(false)} end>
            Sign In
          </NavLink>
          <NavLink to="/register" className={navLink(true)} end>
            Sign Up
          </NavLink>
        </nav>

        <button
          type="button"
          className="public-nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="public-nav-mobile"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      <button
        type="button"
        className={`public-nav__backdrop${open ? ' is-visible' : ''}`}
        aria-label="Close menu"
        tabIndex={-1}
        onClick={close}
      />

      <div
        id="public-nav-mobile"
        className={`public-nav__mobile${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <NavLink to="/login" className={navLink(false)} end onClick={close}>
          Sign In
        </NavLink>
        <NavLink to="/register" className={navLink(true)} end onClick={close}>
          Sign Up
        </NavLink>
      </div>
    </header>
  );
};

export default PublicNavbar;
