export class CreateJobDto {
  title!: string;
  company!: string;
  location?: string;
  remote?: boolean;
  url!: string;
  source!: string;
  description?: string;
  tags?: string[];
  postedAt?: Date;
  metadata?: Record<string, any>;
}