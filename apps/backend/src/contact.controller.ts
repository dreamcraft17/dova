import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ContactDto } from './auth.dto';
import { Public } from './auth.decorators';

@Controller()
export class ContactController {
  constructor(private readonly service: AppService) {}

  @Public()
  @Post('contact') contact(@Body() body: ContactDto) { return this.service.submitContact(body); }
}
