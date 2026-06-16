// src/company/dto/export-companies.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ExportCompaniesDto {
  @ApiProperty({
    example: 100,
    default: 100,
  })
  @IsInt()
  @Min(1)
  companyCount!: number;

  @ApiProperty({
    example: 'unverified',
    enum: [
      'all',
      'verified',
      'unverified',
    ],
  })
  @IsIn([
    'all',
    'verified',
    'unverified',
  ])
  verificationStatus!:
    | 'all'
    | 'verified'
    | 'unverified';

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  opportunityScore?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  includeHighOpportunity!: boolean;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  includeContacts!: boolean;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  includeSocialLinks!: boolean;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  includeRecentSignals!: boolean;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  includeJobStatistics!: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  dateRange?: string;
}