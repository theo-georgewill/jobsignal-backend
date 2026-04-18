export class QueryJobsDto {
  search?: string;
  location?: string;
  remote?: boolean;
  tags?: string; // comma-separated
  role?: string;
  page?: number;
  limit?: number;
}