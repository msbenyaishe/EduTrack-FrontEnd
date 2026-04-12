import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Users, Layers, ClipboardCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
  {
    icon: Layers,
    title: 'Modules & coursework',
    text: 'See what your teachers assign across groups and stay on top of deadlines.',
  },
  {
    icon: Users,
    title: 'Groups that stay organized',
    text: 'Join with an invite code, collaborate with classmates, and keep work in one place.',
  },
  {
    icon: ClipboardCheck,
    title: 'Workshops, agile & more',
    text: 'Submit work, track sprints, and follow internship and PFE workflows in one hub.',
  },
];

const Landing = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="landing-hero__inner">
          <p className="landing-hero__eyebrow">Learning management, simplified</p>
          <h1 id="landing-hero-title" className="landing-hero__title">
            Teach and learn with clarity on <span className="landing-hero__accent">EduTrack</span>
          </h1>
          <p className="landing-hero__lead">
            One place for modules, groups, workshops, and submissions—built for students and teachers.
          </p>
          <div className="landing-hero__actions">
            <Link to="/register" className="btn btn-primary landing-hero__btn-primary">
              Get started
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link to="/login" className="btn btn-secondary landing-hero__btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
        <div className="landing-hero__panel" aria-hidden>
          <div className="landing-hero__card">
            <BookOpen className="landing-hero__card-icon" size={40} strokeWidth={1.75} />
            <p className="landing-hero__card-title">Your academic hub</p>
            <p className="landing-hero__card-text">Dashboards, tasks, and progress—responsive on every device.</p>
          </div>
        </div>
      </section>

      <section className="landing-features" aria-labelledby="landing-features-title">
        <div className="landing-features__inner">
          <h2 id="landing-features-title" className="landing-features__heading">
            Everything you need to stay on track
          </h2>
          <ul className="landing-features__grid">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="landing-feature-card">
                <div className="landing-feature-card__icon-wrap" aria-hidden>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="landing-feature-card__title">{title}</h3>
                <p className="landing-feature-card__text">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="landing-cta-title">
        <div className="landing-cta__inner">
          <h2 id="landing-cta-title" className="landing-cta__title">Ready to begin?</h2>
          <p className="landing-cta__text">Create a free account or sign in to pick up where you left off.</p>
          <div className="landing-cta__actions">
            <Link to="/register" className="btn btn-primary landing-cta__btn">
              Sign up
            </Link>
            <Link to="/login" className="btn btn-secondary landing-cta__btn">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
