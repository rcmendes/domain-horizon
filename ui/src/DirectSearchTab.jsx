import React from 'react';

/**
 * Direct domain search tab.
 * Props: query, setQuery, loading, result, error, onSearch, onRetry
 */
export default function DirectSearchTab({ query, setQuery, loading, result, error, onSearch, onRetry }) {
  return (
    <section className="mode-section glass" style={{ animation: 'none', opacity: 1 }}>
      <h2 className="sr-only">Direct Search</h2>

      <form className="search-container" onSubmit={onSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="e.g. spacex.com"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          aria-label="Domain name to search"
        />
        <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-msg" role="alert">
          <span>{error}</span>
          {onRetry && (
            <button className="retry-btn" onClick={onRetry} type="button">
              Retry
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)' }}>Querying registrars and WHOIS…</p>
        </div>
      )}

      {result && !loading && (
        <div className="result-card glass">
          <div
            className={`status-badge ${
              result.error ? 'status-error' : result.available ? 'status-available' : 'status-taken'
            }`}
          >
            {result.error ? 'Error' : result.available ? 'Available' : 'Taken'}
          </div>

          <h2 className="domain-title">{result.domain}</h2>

          {result.available && result.price && (
            <div className="domain-price">
              {result.currency === 'USD' ? '$' : result.currency + ' '}
              {result.price}
            </div>
          )}

          {!result.available && !result.error && (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Current Owner</span>
                <span className="info-value">{result.owner || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Purchased On</span>
                <span className="info-value">{result.purchasedDate?.split('T')[0] || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Expires On</span>
                <span className="info-value">{result.expirationDate?.split('T')[0] || 'Unknown'}</span>
              </div>
            </div>
          )}

          {result.restrictions && (
            <div className="restrictions-box">
              <h3>Requirements &amp; Restrictions</h3>
              <p>
                <strong>Usage: </strong> {result.restrictions.description}
              </p>
              <p>
                <strong>Country/Region: </strong> {result.restrictions.countryRestriction}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
