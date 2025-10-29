import React from 'react';
import './css/SuccessModal.css';
import { useLanguage } from '../context/LanguageContext.jsx';

const SuccessModal = ({ open, onClose }) => {
  if (!open) return null;
  const { t } = useLanguage();
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h3 className="step-title">{t('success.title')}</h3>
        <div className="policy-box">
          <p>{t('success.p1')}</p>
          <p>{t('success.p2')}</p>
        </div>
        <div className="actions-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { window.location.href = 'https://www.schb.dz/'; }}
          >
            {t('success.backHome')}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>{t('success.close')}</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
