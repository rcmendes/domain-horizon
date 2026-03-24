import React from 'react';

/**
 * Displays a single domain's verification result card.
 */
function VerificationCard({ domain, result }) {
  return (
    <div className="compact-result-card glass">
      <div className="compact-header">
        <span className="compact-domain">{domain}</span>
        {result.loading ? (
          <span className="compact-badge checking">Checking…</span>
        ) : result.error ? (
          <span className="compact-badge error">Error</span>
        ) : result.data.available ? (
          <span className="compact-badge available">Available</span>
        ) : (
          <span className="compact-badge taken">Taken</span>
        )}
      </div>

      {!result.loading && !result.error && result.data && (
        <div className="compact-body">
          {result.data.available ? (
            <div className="compact-price">
              {result.data.currency === 'USD' ? '$' : result.data.currency + ' '}
              {result.data.price}
            </div>
          ) : (
            <div className="compact-info-grid">
              <div className="compact-info-col">
                <span className="compact-label">Owner</span>
                <span className="compact-value" title={result.data.owner || 'Unknown'}>
                  {result.data.owner || 'Unknown'}
                </span>
              </div>
              <div className="compact-info-col">
                <span className="compact-label">Purchased</span>
                <span className="compact-value">
                  {result.data.purchasedDate?.split('T')[0] || '-'}
                </span>
              </div>
              <div className="compact-info-col">
                <span className="compact-label">Expires</span>
                <span className="compact-value">
                  {result.data.expirationDate?.split('T')[0] || '-'}
                </span>
              </div>
            </div>
          )}

          {result.data.restrictions && (
            <div className="compact-restrictions" title={result.data.restrictions.description}>
              <span className="compact-label">Restrictions:</span>{' '}
              {result.data.restrictions.countryRestriction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The full verification results section rendered below the tree.
 */
export default function VerificationResultsSection({ bulkResults }) {
  const entries = Object.entries(bulkResults);
  if (entries.length === 0) return null;

  return (
    <div
      className="verification-results-section"
      style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}
    >
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>
        Verification Results
      </h3>
      <div className="compact-results-list">
        {entries.map(([domain, result]) => (
          <VerificationCard key={domain} domain={domain} result={result} />
        ))}
      </div>
    </div>
  );
}
