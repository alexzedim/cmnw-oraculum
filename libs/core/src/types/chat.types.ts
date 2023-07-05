export interface ChatDialogFlow {
  role: 'user' | 'system' | 'assistant';
  content: string;
  name?: string;
}
