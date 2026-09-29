import {
  ELECTION_TYPE,
  ELECTION_YEAR,
  LGA_QUESTION_KEY,
  SECTION_ONE,
  STATE_QUESTION_KEY,
  WARD_QUESTION_KEY,
  type AnswerValue,
  type Answers,
  type Question,
  type SubmissionRequest,
  type Survey,
  type SurveyResponse,
} from './types'

const MULTI_SEPARATOR = '|'
const RANK_SEPARATOR = ', '

function serializeAnswer(question: Question, value: AnswerValue | undefined): string | null {
  if (value === undefined || value === null) return null

  switch (question.options.type) {
    case 'check': {
      const selected = Array.isArray(value) ? value : []
      if (selected.length === 0) return null
      return MULTI_SEPARATOR + selected.join(MULTI_SEPARATOR)
    }

    case 'rank': {
      const ranks = typeof value === 'object' && !Array.isArray(value) ? value : {}
      const ranked = (question.options.values ?? []).filter((item) => ranks[item])
      if (ranked.length === 0) return null
      return ranked.map((item) => `${item} (${ranks[item]})`).join(RANK_SEPARATOR)
    }

    default:
      return typeof value === 'string' && value !== '' ? value : null
  }
}

export function buildResponse(survey: Survey, answers: Answers): SurveyResponse {
  const response: SurveyResponse = {}

  for (const [sectionKey, section] of Object.entries(survey.sections)) {
    const sectionAnswers = answers[sectionKey] ?? {}
    const sectionResponse: Record<string, string | null> = {}

    for (const [questionKey, question] of Object.entries(section.questions)) {
      sectionResponse[questionKey] = serializeAnswer(question, sectionAnswers[questionKey])
    }

    response[sectionKey] = sectionResponse
  }

  return response
}

export function buildSubmission(
  survey: Survey,
  answers: Answers,
  location: number[] = []
): SubmissionRequest {
  const responses = buildResponse(survey, answers)
  const sectionOne = responses[SECTION_ONE] ?? {}

  return {
    responses,
    location,
    state: sectionOne[STATE_QUESTION_KEY] ?? null,
    lga: sectionOne[LGA_QUESTION_KEY] ?? null,
    ward: sectionOne[WARD_QUESTION_KEY] ?? null,
    election_type: ELECTION_TYPE,
    election_year: ELECTION_YEAR,
  }
}
