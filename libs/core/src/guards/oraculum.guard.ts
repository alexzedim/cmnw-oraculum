export const isArrayPropertyGuard = (response: unknown) =>
  Boolean(Array.isArray(response) && response.length);
