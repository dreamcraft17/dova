import { ReactNode, useState } from 'react';
import { Layout } from './Layout';

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  effectiveDate,
  lastUpdated,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: ReactNode;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  const [tocOpen, setTocOpen] = useState(false);

  const toc = (
    <nav className="legal-toc" aria-label={`${title} sections`}>
      <ol>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={() => setTocOpen(false)}>
              <span className="legal-toc-num">{i + 1}</span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <Layout>
      <section className="legal-page">
        <header className="legal-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="legal-dates">
            <span>Effective date: {effectiveDate}</span>
            <span className="legal-dates-sep" aria-hidden="true">•</span>
            <span>Last updated: {lastUpdated}</span>
          </div>
          <div className="legal-summary">{summary}</div>
        </header>

        <button
          type="button"
          className="legal-toc-toggle"
          aria-expanded={tocOpen}
          onClick={() => setTocOpen((v) => !v)}
        >
          {tocOpen ? 'Hide table of contents' : 'Jump to a section'}
        </button>

        <div className={`legal-body${tocOpen ? ' legal-toc-open' : ''}`}>
          <aside className="legal-toc-wrap">{toc}</aside>

          <div className="legal-content">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="legal-section">
                <h2>
                  <span className="legal-section-num">{i + 1}</span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}

            <div className="legal-contact-card">
              <h3>Questions about this policy?</h3>
              <p>
                Email <a href="mailto:privacy@dova.com">privacy@dova.com</a> for privacy matters, or{' '}
                <a href="mailto:support@dova.com">support@dova.com</a> for anything else — we usually reply
                within a few business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
