import React, { useState, useEffect } from 'react';
import { Building, Plus, X, Pencil, Trash2, FileText } from 'lucide-react';
import { internshipService } from '../../services/internshipService';
import { companyService } from '../../services/companyService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';


const StudentInternships = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const [formData, setFormData] = useState({ company_id: '', supervisor_name: '', start_date: '', end_date: '', report_pdf: '' });
  const [companyData, setCompanyData] = useState({ name: '', phone: '', email: '' });
  const [existingCompanies, setExistingCompanies] = useState([]);
  const [selectedExistingCompanyId, setSelectedExistingCompanyId] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [useNewCompany, setUseNewCompany] = useState(true);
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInternshipId, setCurrentInternshipId] = useState(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const normalize = (payload) => (Array.isArray(payload) ? payload : (payload ? [payload] : []));
      const data = normalize(await internshipService.getStudentInternships());
      setInternships(data);
    } catch (e) {
      console.error(e);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await companyService.getCompanies();
      setExistingCompanies(Array.isArray(companies) ? companies : []);
    } catch (error) {
      console.error('Failed to fetch companies', error);
      setExistingCompanies([]);
    }
  };

  const filteredCompanies = existingCompanies.filter((company) =>
    company.name?.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalCompanyId = selectedExistingCompanyId;

      if (useNewCompany) {
        if (!companyData.name.trim()) {
          alert(t('student.internships.companyNameRequired', { defaultValue: 'Company name is required' }));
          setSubmitting(false);
          return;
        }

        const createdOrExistingCompany = await companyService.createCompany(companyData);
        finalCompanyId = createdOrExistingCompany.id;
      } else if (!finalCompanyId) {
        alert(t('student.internships.selectCompanyRequired', { defaultValue: 'Please select an existing company.' }));
        setSubmitting(false);
        return;
      }

      if (isEditing) {
        if (useNewCompany && formData.company_id && Number(finalCompanyId) === Number(formData.company_id)) {
          await companyService.updateCompany(formData.company_id, companyData);
        }
        await internshipService.updateInternship(currentInternshipId, { ...formData, company_id: finalCompanyId });
      } else {
        await internshipService.submitInternship({ ...formData, company_id: finalCompanyId });
      }

      handleCloseModal();
      fetchInternships();
      fetchCompanies();
    } catch (e) {
      if (e.response?.status === 409) {
        alert(t('student.internships.companyExists', { defaultValue: 'This company already exists in the database. Please enter a different company name.' }));
      } else {
        console.error(t('student.internships.saveErrorLog', { defaultValue: 'Failed to save internship' }), e.response?.data || e.message);
        alert(t('student.internships.saveError', { defaultValue: 'Failed to save to database. Check connection.' }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (intern) => {
    setFormData({
      company_id: intern.company_id,
      supervisor_name: intern.supervisor_name,
      start_date: new Date(intern.start_date).toISOString().split('T')[0],
      end_date: new Date(intern.end_date).toISOString().split('T')[0],
      report_pdf: intern.report_pdf || ''
    });
    setCompanyData({
      name: intern.company_name || '',
      phone: intern.company_phone || '',
      email: intern.company_email || ''
    });
    setUseNewCompany(true);
    setSelectedExistingCompanyId(String(intern.company_id || ''));
    setCompanySearch(intern.company_name || '');
    setCurrentInternshipId(intern.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm(t('student.internships.deleteConfirm', { defaultValue: 'Are you sure you want to delete this internship?' }))) return;
    try {
      await internshipService.deleteInternship(id);
      fetchInternships();
    } catch (e) {
      console.error(t('student.internships.deleteErrorLog', { defaultValue: 'Failed to delete internship' }), e);
      alert(t('student.internships.deleteError', { defaultValue: 'Failed to delete. Check connection.' }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentInternshipId(null);
    setFormData({ company_id: '', supervisor_name: '', start_date: '', end_date: '', report_pdf: '' });
    setCompanyData({ name: '', phone: '', email: '' });
    setUseNewCompany(true);
    setSelectedExistingCompanyId('');
    setCompanySearch('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.internships.title', { defaultValue: 'My Internships' })}</h1>
          <p className="page-subtitle">{t('student.internships.subtitle', { defaultValue: 'Submit and review your internship paperwork.' })}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setUseNewCompany(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> {t('student.internships.new', { defaultValue: 'New Internship' })}
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('student.internships.loading', { defaultValue: 'Loading internships...' })}</div>
        ) : internships.length === 0 ? (
          <div
            className="card-action"
            onClick={() => {
              setUseNewCompany(false);
              setShowModal(true);
            }}
          >
            <div className="card-action__icon">
              <Building size={24} />
            </div>
            <h3 className="card-action__title">{t('student.internships.register', { defaultValue: 'Register Internship' })}</h3>
            <p className="card-action__text">{t('student.internships.registerFirst', { defaultValue: 'Submit your first internship paperwork' })}</p>
          </div>
        ) : (
          <>
            {internships.map(intern => (
              <div key={intern.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <Building size={20} />
                      </div>
                      {intern.company_name}
                    </div>
                  </div>

                  <div className="card__body">
                    <div className="card__emphasis">{t('student.internships.supervisor', { defaultValue: 'Supervisor' })}: {intern.supervisor_name}</div>
                    <div className="date-range">
                       <span className="badge badge-primary">{formatDate(intern.start_date, language)}</span>
                       <span>{t('student.internships.to', { defaultValue: 'to' })}</span>
                       <span className="badge badge-primary">{formatDate(intern.end_date, language)}</span>
                    </div>
                  </div>
                </div>

                <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div className="card__stamp">{t('student.internships.active', { defaultValue: 'Active Internship' })}</div>
                  <div className="card__footer-actions" style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                     {!!intern.report_pdf && (
                      <a href={intern.report_pdf} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('student.internships.viewReport', { defaultValue: 'View Report' })}>
                        <FileText size={18} />
                      </a>
                    )}
                    <button type="button" className="icon-action-btn" onClick={() => handleEditClick(intern)} title={t('student.internships.edit', { defaultValue: 'Edit' })}>
                      <Pencil size={18} />
                    </button>
                    <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDeleteClick(intern.id)} title={t('student.internships.delete', { defaultValue: 'Delete' })}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="card-action"
              onClick={() => {
                setUseNewCompany(false);
                setShowModal(true);
              }}
            >
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">{t('student.internships.addAnother', { defaultValue: 'Add Another Internship' })}</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{isEditing ? t('student.internships.editInternship', { defaultValue: 'Edit Internship' }) : t('student.internships.register', { defaultValue: 'Register Internship' })}</h2>
              <button type="button" className="modal-close" onClick={handleCloseModal} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>{t('student.internships.companyDetails', { defaultValue: 'Company Details' })}</h3>
                <div className="form-group">
                  <label className="form-label">{t('student.internships.chooseCompanyMethod', { defaultValue: 'Company Source' })}</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`btn ${!useNewCompany ? 'btn-primary' : 'btn-secondary'} btn--sm`}
                      onClick={() => setUseNewCompany(false)}
                    >
                      {t('student.internships.selectExistingCompany', { defaultValue: 'Select Existing Company' })}
                    </button>
                    <button
                      type="button"
                      className={`btn ${useNewCompany ? 'btn-primary' : 'btn-secondary'} btn--sm`}
                      onClick={() => setUseNewCompany(true)}
                    >
                      {t('student.internships.addNewCompany', { defaultValue: 'Add New Company' })}
                    </button>
                  </div>
                </div>
                {!useNewCompany ? (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="search-company">{t('student.internships.searchCompany', { defaultValue: 'Search Company' })}</label>
                      <input
                        id="search-company"
                        type="text"
                        className="form-input"
                        placeholder={t('student.internships.searchCompanyPlaceholder', { defaultValue: 'Type company name...' })}
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="existing-company">{t('student.internships.existingCompany', { defaultValue: 'Existing Companies' })}</label>
                      <select
                        id="existing-company"
                        className="form-input"
                        required
                        value={selectedExistingCompanyId}
                        onChange={(e) => setSelectedExistingCompanyId(e.target.value)}
                      >
                        <option value="">{t('student.internships.selectCompany', { defaultValue: 'Select a company' })}</option>
                        {filteredCompanies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : null}
                {useNewCompany ? (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="new-co-name">{t('student.internships.companyName', { defaultValue: 'Company Name' })}</label>
                      <input 
                        id="new-co-name" 
                        type="text" 
                        className="form-input" 
                        required
                        value={companyData.name} 
                        onChange={e => setCompanyData({...companyData, name: e.target.value})} 
                      />
                    </div>
                    <div className="form-row-split">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-co-email">{t('student.internships.companyEmail', { defaultValue: 'Email (Optional)' })}</label>
                        <input 
                          id="new-co-email" 
                          type="email" 
                          className="form-input" 
                          value={companyData.email} 
                          onChange={e => setCompanyData({...companyData, email: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-co-phone">{t('student.internships.companyPhone', { defaultValue: 'Phone (Optional)' })}</label>
                        <input 
                          id="new-co-phone" 
                          type="text" 
                          className="form-input" 
                          value={companyData.phone} 
                          onChange={e => setCompanyData({...companyData, phone: e.target.value})} 
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="form-section">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>{t('student.internships.internshipDetails', { defaultValue: 'Internship Details' })}</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="supervisor">{t('student.internships.supervisorName', { defaultValue: 'Supervisor Name' })}</label>
                <input id="supervisor" type="text" className="form-input" required value={formData.supervisor_name} onChange={e => setFormData({...formData, supervisor_name: e.target.value})} />
              </div>
              <div className="form-row-split" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="start-d">{t('student.internships.startDate', { defaultValue: 'Start Date' })}</label>
                  <input id="start-d" type="date" className="form-input" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end-d">{t('student.internships.endDate', { defaultValue: 'End Date' })}</label>
                  <input id="end-d" type="date" className="form-input" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="report-url">{t('student.internships.reportUrl', { defaultValue: 'Report URL (Optional Link)' })}</label>
                <input id="report-url" type="url" className="form-input" placeholder="https://..." value={formData.report_pdf} onChange={e => setFormData({...formData, report_pdf: e.target.value})} />
              </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>{t('student.internships.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? t('student.internships.saving', { defaultValue: 'Saving...' }) : t('student.internships.saveInternship', { defaultValue: 'Save Internship' })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInternships;
