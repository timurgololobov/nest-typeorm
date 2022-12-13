import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DecrementId } from '../../utils/decrement-id.decorator';
import { CommentDTO } from '../dto/comment.dto';
import { CommentsService } from '../modules/comments/comments.service';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Multer } from 'multer';
import { LoggingInterceptor } from '../modules/logger/logger.interceptor';
import { Comment } from '../database/entities/comment.entity';

@Controller('comments')
@UseInterceptors(LoggingInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('template')
  @Render('index')
  getTemplate(): { message: string } {
    return { message: 'Hello world!' };
  }

  @Get('/')
  async getComments(
    @Query() @DecrementId(['id']) query: { id: number },
  ): Promise<CommentDTO[]> {
    return this.commentsService.getComments(query.id);
  }

  @Get('get-one')
  async getComment(
    @Query()
    @DecrementId(['postId', 'commentId'])
    query: {
      postId: number;
      commentId: number;
    },
  ): Promise<CommentDTO | undefined> {
    return this.commentsService.getComment(query.postId, query.commentId);
  }

  @Post('create')
  async createComment(
    @Query() query: { id: number },
    @Body() data: CommentDTO,
  ): Promise<CommentDTO> {
    return this.commentsService.createComment(query.id, data);
  }

  @Delete('delete')
  async deleteComment(
    @Body() body: { postId: number; commentId: number },
  ): Promise<Comment> {
    return this.commentsService.deleteComment(body.postId, body.commentId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.commentsService.saveFile('files/receipt.pdf', file.buffer);
  }

  @Get('file')
  async getFile(@Res() response: Response) {
    console.log(join(process.cwd() + 'package.json'));
    await this.commentsService.getFile(response);
  }
}
