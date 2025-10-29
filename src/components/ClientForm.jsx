import React, { useState } from 'react';
import './css/ReportForm.css';
import SuccessModal from './SuccessModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ClientForm = ({ prefillEmail = '' }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: prefillEmail,
    phone: '',
    orderNumber: '',
    incidentDate: '',
    department: '',
    relationType: '',
    description: '',
    evidence: null
  });

  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Client Form Data:', formData);
    setSuccessOpen(true);
    setTimeout(() => {
      const total = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const middle = Math.max(0, (total - window.innerHeight) / 2);
      window.scrollTo({ top: middle, behavior: 'smooth' });
    }, 0);
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>{t('client.title')}</h2>
      
      <div className="form-group">
        <label htmlFor="fullName">{t('client.fullName')}</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">{t('client.company')}</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="relationType">{t('client.relation')}</label>
          <select
            id="relationType"
            name="relationType"
            value={formData.relationType}
            onChange={handleChange}
            required
          >
            <option value="">{t('client.relation.opt')}</option>
            <option value="client-direct">{t('client.relation.clientDirect')}</option>
            <option value="client-indirect">{t('client.relation.clientIndirect')}</option>
            <option value="distributeur">{t('client.relation.distributor')}</option>
            <option value="revendeur">{t('client.relation.retailer')}</option>
            <option value="autre">{t('client.relation.other')}</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">{t('common.email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            className="non-interactive-email"
            style={{
              cursor: 'default',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              color: '#666'
            }}
            onClick={(e) => e.preventDefault()}
            onFocus={(e) => e.target.blur()}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">{t('common.phone')}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleChange(e);
            }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="orderNumber">{t('client.orderNumber')}</label>
          <input
            type="text"
            id="orderNumber"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="incidentDate">{t('common.incidentDateTime')}</label>
          <input
            type="datetime-local"
            id="incidentDate"
            name="incidentDate"
            value={formData.incidentDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="department">{t('client.department')}</label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">{t('client.department.opt')}</option>
          <option value="commercial">{t('dept.commercial')}</option>
          <option value="logistique">{t('dept.logistique')}</option>
          <option value="facturation">{t('dept.facturation')}</option>
          <option value="qualite">{t('dept.qualite')}</option>
          <option value="autre">{t('dept.autre')}</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">{t('common.description')}</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          placeholder={t('client.description.ph')}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="evidence">{t('common.evidence')}</label>
        <input
          type="file"
          id="evidence"
          name="evidence"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>

      

      <button type="submit" className="submit-btn">{t('client.submit')}</button>
      <SuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </form>
  );
};

export default ClientForm;