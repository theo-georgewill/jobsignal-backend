export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  invalid: number;
  errors: string[];
};