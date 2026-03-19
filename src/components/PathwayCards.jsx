// PathwayCards.jsx
// Подключи шрифты в _document.tsx или layout:
// <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
//
// Sanity GROQ:
// const query = groq`*[_type == "pathwayCards"][0].cards[]{ label, title, desc, cta, href }`
// const cards = await client.fetch(query)
// <PathwayCards cards={cards} />

const styles = `
  .fork-section { max-width: 1280px; margin: 0 auto; padding: 0 24px 80px; }
  .fork-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .fork-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 24px; text-decoration: none; display: block; transition: border-color 0.2s, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s; }
  .fork-card:hover { border-color: #2563EB; background: rgba(255,255,255,0.12); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(37,99,235,0.18); }
  .fork-card:hover .fork-card-cta { text-decoration: underline; }
  .fork-card-label { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
  .fork-card-title { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px; }
  .fork-card-desc { font-family: 'Open Sans', sans-serif; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.6); }
  .fork-card-cta { font-family: 'Outfit', sans-serif; margin-top: 16px; font-size: 15px; font-weight: 600; color: #2563EB; }
  @media (max-width: 960px) { .fork-section { padding: 0 16px 48px; } }
  @media (max-width: 480px) { .fork-grid { grid-template-columns: 1fr; } }
`

const defaultCards = [
  {
    label: 'For candidates',
    title: 'I want to run for office',
    desc: 'Get your campaign plan, voter data, and outreach tools — free to start. No party needed.',
    cta: 'Start my campaign →',
    href: 'https://app.goodparty.org/sign-up',
  },
  {
    label: 'For supporters',
    title: 'I want to help a candidate',
    desc: 'Volunteer, donate, or spread the word for an independent candidate near you.',
    cta: 'Find a candidate →',
    href: 'https://goodparty.org/elections',
  },
  {
    label: 'Exploring?',
    title: "I'm not sure where to start",
    desc: 'See what it takes to run locally — and find out if GoodParty is right for you.',
    cta: 'Take the quiz →',
    href: 'https://goodparty.org/run-for-office',
  },
]

export default function PathwayCards({ cards = defaultCards }) {
  return (
    <>
      <style>{styles}</style>
      <div className="fork-section">
        <div className="fork-grid">
          {cards.map((card) => (
            <a key={card.label} href={card.href} className="fork-card">
              <div className="fork-card-label">{card.label}</div>
              <div className="fork-card-title">{card.title}</div>
              <div className="fork-card-desc">{card.desc}</div>
              <div className="fork-card-cta">{card.cta}</div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
