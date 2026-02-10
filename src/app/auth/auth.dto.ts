import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  username: string;
}

export class SignInDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;
}
