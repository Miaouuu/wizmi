export interface CreateFeedbackInput {
  title: string;
  description: string;
}

export interface ValidateFeedbackParams {
  id: number;
}

export interface DeleteFeedbackParams{
  token: number
}
