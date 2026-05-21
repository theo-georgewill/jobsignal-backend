import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpportunityResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  momentum!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  summary?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
