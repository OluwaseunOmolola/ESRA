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