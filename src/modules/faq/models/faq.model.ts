export interface Faq {
  id: string;
  question: string;
  answer: string;
  priority: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
