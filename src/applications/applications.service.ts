import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.application.delete({
      where: { id },
    });
  }
}