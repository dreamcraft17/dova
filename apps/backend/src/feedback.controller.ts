import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ChangelogDto, FeedbackCommentDto, FeedbackPostDto, FeedbackStatusDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';
import { CurrentUser, OptionalAuth, Public, Roles } from './auth.decorators';
import { StoredUser } from './database.service';

@Controller()
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Public()
  @Get('feedback/posts') listFeedback(@Query('sort') sort: 'votes' | 'new' = 'votes', @Query('search') search = '') {
    return this.feedback.list(sort, search);
  }

  @Public()
  @Get('feedback/posts/:id') getFeedback(@Param('id') id: string) { return this.feedback.find(id); }

  @Public()
  @Get('feedback/roadmap') feedbackRoadmap() { return this.feedback.roadmap(); }

  @OptionalAuth()
  @Post('feedback/posts') createFeedback(@CurrentUser() user: StoredUser | undefined, @Body() body: FeedbackPostDto) {
    return this.feedback.create(body, user);
  }

  @Post('feedback/posts/:id/vote') voteFeedback(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.feedback.vote(id, user);
  }

  @Roles('admin')
  @Put('feedback/posts/:id/status') feedbackStatus(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() body: FeedbackStatusDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.setStatus(id, body.status);
  }

  @Public()
  @Get('feedback/posts/:id/comments') feedbackComments(@Param('id') id: string) { return this.feedback.listComments(id); }

  @OptionalAuth()
  @Post('feedback/posts/:id/comments') addFeedbackComment(@CurrentUser() user: StoredUser | undefined, @Param('id') id: string, @Body() body: FeedbackCommentDto) {
    return this.feedback.addComment(id, body, user, false);
  }

  @Roles('admin')
  @Post('feedback/posts/:id/official-reply') officialReply(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() body: FeedbackCommentDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.addComment(id, body, user, true);
  }

  @Public()
  @Get('feedback/changelog') listChangelog() { return this.feedback.listChangelogs(); }

  @Public()
  @Get('feedback/changelog/:slug') getChangelog(@Param('slug') slug: string) { return this.feedback.getChangelog(slug); }

  @Roles('admin')
  @Post('feedback/changelog') createChangelog(@CurrentUser() user: StoredUser, @Body() body: ChangelogDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.createChangelog(body);
  }

  @Public()
  @Get('feedback/config') feedbackConfig() {
    return { enabled: true, native: true, features: ['board', 'votes', 'comments', 'roadmap', 'changelog', 'admin'] };
  }
}
