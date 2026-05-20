import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  careersUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  atsType?: string;

  @ApiPropertyOptional({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priority?: number;
}