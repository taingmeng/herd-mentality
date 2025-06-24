export interface MainProps {
  questions: Question[];
}

export interface Question {
  category: string;
  word: string;
}