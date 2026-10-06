export type QuestionType = 'select' | 'check' | 'string' | 'rank' | 'states' | 'lgas';

export interface QuestionOptions {
  type: QuestionType;
  values?: string[];
}

export interface Question {
  question: string;
  options: QuestionOptions;
}

export interface Section {
  title: string;
  questions: Record<string, Question>;
}

export interface Survey {
  title: string;
  form_code: string;
  sections: Record<string, Section>;
}

export type AnswerValue = string | string[] | Record<string, string>;

/** sectionKey -> questionKey -> raw answer */
export type Answers = Record<string, Record<string, AnswerValue>>;

/** sectionKey -> questionKey -> serialised answer, null when unanswered */
export type SurveyResponse = Record<string, Record<string, string | null>>;

export const ELECTION_TYPE = 'presidential';
export const ELECTION_YEAR = '2027';

/** Share of questions that must be answered before Finish unlocks */
export const MIN_ANSWER_RATIO = 0.5;

export const SECTION_ONE = '1';
export const STATE_QUESTION_KEY = '1';
export const LGA_QUESTION_KEY = '2';
export const WARD_QUESTION_KEY = '3';

/**
 * Questions kept in the survey definition but never asked. They are hidden from the
 * form and the preview, and are always serialised as null.
 */
export function isHiddenQuestion(sectionKey: string, questionKey: string): boolean {
  return sectionKey === SECTION_ONE && questionKey === WARD_QUESTION_KEY;
}

export interface SubmissionRequest {
  responses: SurveyResponse;
  /** [latitude, longitude], empty when the browser cannot provide a fix */
  location: number[];
  state: string | null;
  lga: string | null;
  ward: string | null;
  /** Cloudflare Turnstile token; null when the widget could not be loaded */
  turnstile_token: string | null;
  election_type: string;
  election_year: string;
}