import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, HeartPulse, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const EligibilityModal = ({ isOpen, onClose, onRegisterClick }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    age: '',
    weight: '',
    donatedRecently: 'no',
    healthyToday: 'yes',
    pregnantOrNursing: 'no'
  });
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleEvaluate = (e) => {
    e.preventDefault();
    const ageNum = parseInt(answers.age, 10);
    const weightNum = parseFloat(answers.weight);

    const isAgeOk = ageNum >= 18 && ageNum <= 65;
    const isWeightOk = weightNum >= 50;
    const isDonationOk = answers.donatedRecently === 'no';
    const isHealthOk = answers.healthyToday === 'yes';
    const isNursingOk = answers.pregnantOrNursing === 'no';

    const eligible = isAgeOk && isWeightOk && isDonationOk && isHealthOk && isNursingOk;

    setResult({
      eligible,
      reasons: [
        !isAgeOk && 'Donors must be between 18 and 65 years old.',
        !isWeightOk && 'Minimum weight requirement is 50 kg (110 lbs).',
        !isDonationOk && 'You must wait at least 3 months (90 days) between blood donations.',
        !isHealthOk && 'You should be in good health and symptom-free on the day of donation.',
        !isNursingOk && 'Pregnant or breastfeeding individuals must wait before donating.'
      ].filter(Boolean)
    });

    if (eligible) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnswers({
      age: '',
      weight: '',
      donatedRecently: 'no',
      healthyToday: 'yes',
      pregnantOrNursing: 'no'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-wrap" style={{ width: '32px', height: '32px' }}>
              <HeartPulse size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Quick Eligibility Check</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!result ? (
            <form onSubmit={handleEvaluate}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                Answer these 5 quick questions to see if you can safely donate whole blood today.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Age (Years)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 25"
                    className="form-input"
                    value={answers.age}
                    onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="250"
                    placeholder="e.g. 68"
                    className="form-input"
                    value={answers.weight}
                    onChange={(e) => setAnswers({ ...answers, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Have you donated blood within the last 3 months?</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="donatedRecently"
                      checked={answers.donatedRecently === 'no'}
                      onChange={() => setAnswers({ ...answers, donatedRecently: 'no' })}
                    />
                    <span>No</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="donatedRecently"
                      checked={answers.donatedRecently === 'yes'}
                      onChange={() => setAnswers({ ...answers, donatedRecently: 'yes' })}
                    />
                    <span>Yes (within 90 days)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Are you feeling well and symptom-free today?</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="healthyToday"
                      checked={answers.healthyToday === 'yes'}
                      onChange={() => setAnswers({ ...answers, healthyToday: 'yes' })}
                    />
                    <span>Yes, I feel healthy</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="healthyToday"
                      checked={answers.healthyToday === 'no'}
                      onChange={() => setAnswers({ ...answers, healthyToday: 'no' })}
                    />
                    <span>No (fever, cold, on antibiotics)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ margin: '24px -24px -24px -24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Check My Eligibility <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              {result.eligible ? (
                <div>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}
                  >
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Congratulations! You Are Eligible!
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
                    You meet all primary criteria for blood donation. Your donation can save up to 3 precious lives!
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        onClose();
                        onRegisterClick();
                      }}
                    >
                      Register as a Donor Now
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset}>
                      Check Again
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#fffbeb',
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}
                  >
                    <AlertTriangle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Temporarily Ineligible to Donate
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Please review the following requirements before donating:
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      textAlign: 'left',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.88rem',
                      color: '#dc2626'
                    }}
                  >
                    {result.reasons.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>•</span> {r}
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    Check Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
