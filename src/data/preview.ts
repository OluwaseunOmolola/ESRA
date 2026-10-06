import { isHiddenQuestion, type AnswerValue, type Answers, type Question, type Survey } from './types'

export interface QuestionPreview {
  number: number
  question: string
  answers: string[]
  multiple: boolean
  answered: boolean
}

export interface SectionPreview {
  number: number
  title: string
  questions: QuestionPreview[]
}

function previewAnswer(question: Question, value: AnswerValue | undefined): string[] {
  if (value === undefined || value === null) return []

  switch (question.options.type) {
    case 'check':
      return Array.isArray(value) ? value : []

    case 'rank': {
      const ranks = typeof value === 'object' && !Array.isArray(value) ? value : {}
      return (question.options.values ?? [])
        .filter((item) => ranks[item])
        .map((item) => ({ item, rank: ranks[item] }))
        .sort((a, b) => Number(a.rank) - Number(b.rank))
        .map(({ item, rank }) => `${item} (${rank})`)
    }

    default:
      return typeof value === 'string' && value !== '' ? [value] : []
  }
}

export function buildPreview(survey: Survey, answers: Answers): SectionPreview[] {
  return Object.entries(survey.sections).map(([sectionKey, section], sectionIndex) => ({
    number: sectionIndex + 1,
    title: section.title,
    questions: Object.entries(section.questions)
      .filter(([questionKey]) => !isHiddenQuestion(sectionKey, questionKey))
      .map(([questionKey, question], questionIndex) => {
        const values = previewAnswer(question, answers[sectionKey]?.[questionKey])
        const multiple = question.options.type === 'check' || question.options.type === 'rank'

        return {
          number: questionIndex + 1,
          question: question.question,
          answers: values,
          multiple,
          answered: values.length > 0,
        }
      }),
  }))
}
