interface Props {
  /** Omit to render the page as read-only reference material */
  onBegin?: () => void
  /** Answers found in a previous visit, 0 when there is nothing to resume */
  savedCount?: number
  onStartOver?: () => void
}

export default function Introduction({ onBegin, savedCount = 0, onStartOver }: Props) {
  return (
    <div className="card intro">
      <p className="salutation">Dear Respondent,</p>

      <p>
        This survey aims to gather information on potential risks and threats that may affect the
        upcoming elections in your area. Your responses will help stakeholders to take proactive
        measures to ensure peaceful elections.
      </p>

      <p>
        <strong>Confidentiality:</strong> All responses are anonymous and will be treated with
        strict confidentiality. Your participation is voluntary, and you may choose to skip any
        question you're uncomfortable with.
      </p>

      <p>
        <strong>Consent:</strong> By proceeding with this survey, you acknowledge that you
        understand the purpose of the survey and consent to participate.
      </p>

      {onBegin && (
        <>
          <h2>Before you begin</h2>

          <ul className="intro-notes">
            <li>
              The survey runs across 17 sections. At least half of the questions must be
              answered.
            </li>
            <li>Sharing your location is optional, but it helps us understand where responses come from.</li>
            <li>You can only submit once from a single device.</li>
          </ul>

          {savedCount > 0 && (
            <p className="hint saved-note">
              Your progress was saved on this device and your answers have been restored.
            </p>
          )}

          <div className="nav-row">
            <button onClick={onBegin}>
              {savedCount > 0 ? 'Continue survey' : 'Begin survey'}
            </button>
            {savedCount > 0 && onStartOver && (
              <button className="ghost" onClick={onStartOver}>
                Start over
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}