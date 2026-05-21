import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  source!: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  remote!: boolean;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  workMode?: string;

  @ApiPropertyOptional()
  employmentType?: string;

  @ApiPropertyOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  salaryMax?: number;

  @ApiPropertyOptional()
  salaryCurrency?: string;

  @ApiProperty({
    type: [String],
  })
  tags!: string[];

  @ApiProperty()
  createdAt!: Date;
}
