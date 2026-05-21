import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiProperty()
  careersUrl!: string;

  @ApiProperty()
  atsType!: string;

  @ApiProperty({
    type: [String],
  })
  tags!: string[];

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  healthy!: boolean;

  @ApiPropertyOptional()
  crawlError?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
