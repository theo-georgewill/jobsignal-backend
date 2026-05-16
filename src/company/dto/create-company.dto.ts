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

  @ApiProperty()
  @IsUrl()
  careersUrl!: string;

  @ApiProperty()
  @IsString()
  atsType!: string;

  @ApiProperty({
    type: [String],
  })
  @IsArray()
  tags!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priority?: number;
}