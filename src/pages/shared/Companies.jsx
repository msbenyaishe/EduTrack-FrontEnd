import React, { useState, useEffect } from 'react';
import { Building, Phone, Mail, Trash2 } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const Companies = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data || []);
    } catch (e) {
      console.error('Failed to fetch companies', e);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('companies.deleteConfirm', { defaultValue: 'Are you sure you want to delete this company?' }))) return;
    
    try {
      await companyService.deleteCompany(id);
      fetchCompanies();
    } catch (e) {
      console.error('Failed to delete company', e);
      alert(e.response?.data?.message || t('companies.deleteFailed', { defaultValue: 'Failed to delete company. It might be linked to existing internships.' }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('companies.title', { defaultValue: 'Companies' })}</h1>
          <p className="page-subtitle">{t('companies.subtitle', { defaultValue: 'View all registered companies and their details.' })}</p>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('companies.loading', { defaultValue: 'Loading companies...' })}</div>
        ) : companies.length === 0 ? (
          <div className="empty-state">
            <Building size={48} className="empty-state__icon" />
            <h3>{t('companies.empty', { defaultValue: 'No companies found' })}</h3>
            <p>{t('companies.emptyDesc', { defaultValue: 'Companies added through internships will appear here.' })}</p>
          </div>
        ) : (
          companies.map(company => (
            <div key={company.id} className="card card--col">
              <div className="card__head">
                <div className="card__title-group">
                  <div className="media-icon media-icon--primary">
                    <Building size={20} />
                  </div>
                  {company.name}
                </div>
              </div>

              <div className="card__body">
                {company.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>{company.phone}</span>
                  </div>
                )}
                {!company.email && !company.phone && (
                  <div className="card__emphasis">
                    {t('companies.noContactInfo', { defaultValue: 'No contact information available' })}
                  </div>
                )}
              </div>

              <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card__stamp">{t('companies.registeredCompany', { defaultValue: 'Registered Company' })}</div>
                {user?.role === 'teacher' && (
                  <button 
                    type="button" 
                    className="icon-action-btn icon-action-btn--danger icon-action-btn--lg" 
                    onClick={() => handleDelete(company.id)}
                    title={t('companies.delete', { defaultValue: 'Delete Company' })}
                  >
                    <Trash2 size={24} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Companies;
