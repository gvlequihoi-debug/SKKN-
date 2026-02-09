export enum GenerationStep {
  INPUT_TOPIC = 'INPUT_TOPIC',
  GENERATING_OUTLINE = 'GENERATING_OUTLINE',
  REVIEW_OUTLINE = 'REVIEW_OUTLINE',
  WRITING_CONTENT = 'WRITING_CONTENT',
  COMPLETED = 'COMPLETED',
}

export interface OutlineSection {
  id: string;
  title: string;
  description: string; // Instructions for the AI on what to write in this section
  isHeading: boolean; // If true, it's a main category (A, B, I, II), otherwise it's writable content
}

export interface GeneratedContent {
  sectionId: string;
  title: string;
  content: string;
}

export interface FullDocument {
  topic: string;
  author: string;
  school: string;
  year: string;
  content: GeneratedContent[];
}