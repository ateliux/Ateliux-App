import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog')
@Controller()
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('blog/posts')
  findPublished() {
    return this.blog.findPublished();
  }

  @Get('blog/posts/:id')
  findPublishedBySlug(@Param() params: IdParamDto) {
    return this.blog.findPublishedBySlug(params.id);
  }

  @Get('blog/categories')
  categories() {
    return this.blog.categories();
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
  @Post('admin/blog/posts')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateBlogPostDto) {
    return this.blog.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Patch('admin/blog/posts/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateBlogPostDto) {
    return this.blog.update(params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Delete('admin/blog/posts/:id')
  remove(@Param() params: IdParamDto) {
    return this.blog.remove(params.id);
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
}
