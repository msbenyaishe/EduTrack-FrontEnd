import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Users, Layers, ClipboardCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  const features = [
    {
      icon: Layers,
      title: t('landing.feature1Title'),
      text: t('landing.feature1Text'),
    },
    {
      icon: Users,
      title: t('landing.feature2Title'),
      text: t('landing.feature2Text'),
    },
    {
      icon: ClipboardCheck,
      title: t('landing.feature3Title'),
      text: t('landing.feature3Text'),
    },
  ];

  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="landing-hero__inner">
          <p className="landing-hero__eyebrow">{t('landing.eyebrow')}</p>
          <h1 id="landing-hero-title" className="landing-hero__title">
            {t('landing.titlePrefix')} <span className="landing-hero__accent">{t('common.appName')}</span>
          </h1>
          <p className="landing-hero__lead">
            {t('landing.lead')}
          </p>
          <div className="landing-hero__actions">
            <Link to="/register" className="btn btn-primary landing-hero__btn-primary">
              {t('landing.getStarted')}
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link to="/login" className="btn btn-secondary landing-hero__btn-secondary">
              {t('landing.signIn')}
            </Link>
          </div>
        </div>
        <div className="landing-hero__panel" aria-hidden>
          <div className="landing-hero__card">
            <BookOpen className="landing-hero__card-icon" size={40} strokeWidth={1.75} />
            <p className="landing-hero__card-title">{t('landing.cardTitle')}</p>
            <p className="landing-hero__card-text">{t('landing.cardText')}</p>
          </div>
        </div>
      </section>

      <section className="landing-features" aria-labelledby="landing-features-title">
        <div className="landing-features__inner">
          <h2 id="landing-features-title" className="landing-features__heading">
            {t('landing.featuresTitle')}
          </h2>
          <ul className="landing-features__grid">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
              <li key={feature.title} className="landing-feature-card">
                <div className="landing-feature-card__icon-wrap" aria-hidden>
                  <FeatureIcon size={22} strokeWidth={2} />
                </div>
                <h3 className="landing-feature-card__title">{feature.title}</h3>
                <p className="landing-feature-card__text">{feature.text}</p>
              </li>
            );
            })}
          </ul>
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="landing-cta-title">
        <div className="landing-cta__inner">
          <h2 id="landing-cta-title" className="landing-cta__title">{t('landing.ctaTitle')}</h2>
          <p className="landing-cta__text">{t('landing.ctaText')}</p>
          <div className="landing-cta__actions">
            <Link to="/register" className="btn btn-primary landing-cta__btn">
              {t('landing.ctaSignUp')}
            </Link>
            <Link to="/login" className="btn btn-secondary landing-cta__btn">
              {t('landing.signIn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
