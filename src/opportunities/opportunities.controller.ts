import { Controller, Get, Param } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { OpportunitiesService } from './opportunities.service';

import { OpportunityResponseDto } from './dto/opportunity-response.dto';

@ApiTags('Opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all opportunities',
  })
  @ApiResponse({
    status: 200,
    type: [OpportunityResponseDto],
  })
  findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get(':companyId')
  @ApiOperation({
    summary: 'Get opportunity by company ID',
  })
  @ApiParam({
    name: 'companyId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: OpportunityResponseDto,
  })
  findOne(@Param('companyId') companyId: string) {
    return this.opportunitiesService.findByCompany(companyId);
  }
}
