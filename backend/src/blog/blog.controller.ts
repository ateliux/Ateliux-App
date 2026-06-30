import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { BlogService } from './blog.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { ShareBlogPostDto } from './dto/share-blog-post.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog')
@Controller()
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('blog/posts')
  findPublished() {
    return this.blog.findPublished();
  }

  @Get('blog/posts/:id/comments')
  publicComments(@Param() params: IdParamDto) {
    return this.blog.publishedComments(params.id);
  }

  @Post('blog/posts/:id/share')
  share(@Param() params: IdParamDto, @Body() dto: ShareBlogPostDto) {
    return this.blog.share(params.id, dto);
  }

  @Get('blog/posts/:id')
  findPublishedBySlug(@Param() params: IdParamDto) {
    return this.blog.findPublishedBySlug(params.id);
  }

  @Get('blog/categories')
  categories() {
    return this.blog.categories();
  }

  @Get('blog/tags')
  tags() {
    return this.blog.tags();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('client/blog/saved')
  saved(@CurrentUser() user: RequestUser) {
    return this.blog.saved(user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('client/blog/posts/:id/saved-status')
  savedStatus(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.blog.savedStatus(user, params.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/blog/posts/:id/save')
  save(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.blog.save(user, params.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('client/blog/posts/:id/save')
  unsave(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.blog.unsave(user, params.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/blog/posts/:id/comments')
  createComment(
    @CurrentUser() user: RequestUser,
    @Param() params: IdParamDto,
    @Body() dto: CreateBlogCommentDto,
  ) {
    return this.blog.createComment(user, params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/blog/posts/:id/message-thread')
  messageThread(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.blog.messageThread(user, params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/blog/posts')
  adminAll() {
    return this.blog.adminAll();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/blog/posts/:id')
  adminOne(@Param() params: IdParamDto) {
    return this.blog.adminOne(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Post('admin/blog/posts')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateBlogPostDto) {
    return this.blog.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Patch('admin/blog/posts/:id')
  update(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: UpdateBlogPostDto) {
    return this.blog.update(params.id, user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Delete('admin/blog/posts/:id')
  remove(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.blog.remove(params.id, user);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Post('admin/blog/posts/:id/publish')
  publish(@Param() params: IdParamDto) {
    return this.blog.publish(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Post('admin/blog/posts/:id/unpublish')
  unpublish(@Param() params: IdParamDto) {
    return this.blog.unpublish(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Post('admin/blog/posts/:id/archive')
  archive(@Param() params: IdParamDto) {
    return this.blog.archive(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/blog/tags')
  adminTags() {
    return this.blog.tags();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Post('admin/blog/tags')
  createTag(@Body() dto: CreateBlogCategoryDto) {
    return this.blog.createTag(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Patch('admin/blog/tags/:id')
  updateTag(@Param() params: IdParamDto, @Body() dto: UpdateBlogCategoryDto) {
    return this.blog.updateTag(params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Delete('admin/blog/tags/:id')
  deleteTag(@Param() params: IdParamDto) {
    return this.blog.deleteTag(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/blog/posts/:id/comments')
  adminComments(@Param() params: IdParamDto) {
    return this.blog.adminComments(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Delete('admin/blog/comments/:id')
  deleteComment(@Param() params: IdParamDto) {
    return this.blog.deleteComment(params.id);
  }
}
