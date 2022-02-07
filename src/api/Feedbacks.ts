export interface CreateFeedbackInput {
  title: string;
  description: string;
}

export interface ValidateFeedbackParams {
  id: number;
}

export interface DeleteFeedbackParams{
  id: number
}

export interface Feedbacks{
  id: number
  title: string
  description: string
  createdAt: string
}
