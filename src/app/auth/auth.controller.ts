import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { Request } from '~/@types/app';
import { SignInDto, SignUpDto } from '~/app/auth/auth.dto';
import { CookieAuthGuard } from '~/app/auth/auth.guard';
import { AuthService } from '~/app/auth/auth.service';
import { CookieService } from '~/utils/cookie.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService
  ) {}

  @Get()
  @UseGuards(CookieAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user session'
  })
  async auth(@Req() req: Request, @Res() res: Response) {
    return res.status(HttpStatus.OK).json(req.user);
  }

  @Post('signout')
  @ApiResponse({
    status: 200,
    description: 'Signs out the authenticated user'
  })
  @UseGuards(CookieAuthGuard)
  async signOut(@Req() req: Request, @Res() res: Response) {
    const session = req.user;
    await this.authService.signOut(session);

    return res.status(HttpStatus.OK).send();
  }

  @Post('signin')
  @ApiResponse({ status: 200, description: 'Signs in a user' })
  async signIn(@Body() body: SignInDto, @Res() res: Response) {
    const data = await this.authService.signIn(body);

    const { id } = data;

    this.cookieService.auth(res, id);

    return res.status(HttpStatus.OK).json(data);
  }

  @Post('signup')
  @ApiResponse({ status: 200, description: 'Signs up a new user' })
  async signUp(@Body() body: SignUpDto, @Res() res: Response) {
    const data = await this.authService.signUp(body);

    const { id } = data;

    this.cookieService.auth(res, id);

    return res.status(HttpStatus.CREATED).json(data);
  }
}
