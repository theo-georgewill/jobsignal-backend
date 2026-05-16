import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional()
  jobId?: string;

  @ApiPropertyOptional()
  externalTitle?: string;

  @ApiPropertyOptional()
  externalCompany?: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  appliedAt!: Date;

  @ApiPropertyOptional()
  followUpDate?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}