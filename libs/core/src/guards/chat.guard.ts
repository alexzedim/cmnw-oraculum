export const v4CompletionGuard = (response: unknown) =>
  typeof response === 'object' &&
  'choices' in response &&
  Array.isArray(response.choices) &&
  response.choices.length;
