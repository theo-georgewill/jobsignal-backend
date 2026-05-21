import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    example: 'clx123abc456',
  })
  userId!: string;

  @ApiProperty({
    example: 'theo@example.com',
  })
  email!: string;

  @ApiProperty({
    example: 'user',
  })
  role!: string;
}
