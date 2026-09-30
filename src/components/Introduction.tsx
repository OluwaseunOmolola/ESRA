interface Objective {
  lead: string
  rest: string
}

const OBJECTIVES: Objective[] = [
  {
    lead: 'Identify and map potential electoral security risks',
    rest: ' by analysing historical patterns, current conditions, local dynamics, and emerging trends that could affect peaceful participation and electoral integrity.',
  },
  {
    lead: 'Assess the nature and severity of identified risks',
    rest: ' across locations and provide stakeholders with evidence-based insights into factors that may contribute to electoral violence, insecurity, or disruptions to the electoral process.',
  },
  {
    lead: 'Strengthen early warning and situational awareness',
    rest: ' by providing timely and integrated risk information that supports coordinated decision-making and the dissemination of early warning signals.',
  },
  {
    lead: 'Support targeted preventive interventions',
    rest: ' by identifying high-risk areas and specific risk factors that can inform appropriate and context-sensitive electoral security responses.',
  },
  {
    lead: 'Promote community-level prevention and mitigation',
    rest: ' by supporting communities, peace infrastructures, and civil society organisations to develop grassroots strategies that complement state-led electoral security interventions.',
  },
  {
    lead: 'Contribute to a peaceful and credible electoral environment',
    rest: ' by providing relevant stakeholders with practical evidence to anticipate emerging risks, coordinate preventive action, and protect peaceful electoral participation.',
  },
]

interface Props {
  onBegin: () => void
}

export default function Introduction({ onBegin }: Props) {
  return (
    <div className="card intro">
      <h2>Introduction</h2>

      <p>
        The Election Security Risk Assessment (ESRA) is an independent analytical exercise
        designed to identify, assess, and communicate potential risks that may affect electoral
        integrity, peaceful participation, and public confidence in the electoral process. It
        provides a structured assessment of the pre-election environment by examining the range of
        factors, actors, behaviours, and local dynamics that may contribute to electoral violence,
        insecurity, or other disruptions to the electoral process.
      </p>

      <p>
        The ESRA draws on multiple sources of evidence, including public perception surveys,
        stakeholder consultations, incident and media monitoring, field observations, historical
        trends, and relevant secondary data. By bringing these sources together, the assessment
        provides an integrated understanding of emerging risks and their potential implications
        across different locations.
      </p>

      <p>
        The assessment does not predict or presume the occurrence of violence, electoral
        malpractice, or misconduct by any individual, institution, political party, or stakeholder.
        Rather, it identifies potential risk factors, emerging trends, and areas of concern that may
        require preventive attention. The findings are intended to support evidence-based
        decision-making, strengthen situational awareness, and enable electoral stakeholders,
        security actors, civil society organisations, and communities to develop timely and
        context-specific mitigation measures.
      </p>

      <h2>Core Objectives</h2>

      <p>The ESRA seeks to:</p>

      <ol className="objectives">
        {OBJECTIVES.map((objective) => (
          <li key={objective.lead}>
            <strong>{objective.lead}</strong>
            {objective.rest}
          </li>
        ))}
      </ol>

      <h2>Before you begin</h2>

      <ul className="intro-notes">
        <li>The survey runs across 17 sections. At least half of the questions must be answered.</li>
        <li>Your browser will ask for your location. Location access is required to submit.</li>
        <li>You can only submit once from a single device.</li>
      </ul>

      <div className="nav-row">
        <button onClick={onBegin}>Begin survey</button>
      </div>
    </div>
  )
}
