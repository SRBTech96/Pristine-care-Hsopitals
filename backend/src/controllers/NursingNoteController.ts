
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  NotFoundException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { NursingNoteService, CreateNursingNoteDTO } from '../services/NursingNoteService';

@Controller('nursing-notes')
export class NursingNoteController {
  constructor(private readonly nursingNoteService: NursingNoteService) {}

  @Post()
  @HttpCode(201)
  async createNote(
    @Body() dto: CreateNursingNoteDTO,
    @Req() req: Request & { user?: { id?: string } }
  ): Promise<object> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      const note = await this.nursingNoteService.createNote(dto, userId);
      return { success: true, data: note };
    } catch (error: unknown) {
      throw new BadRequestException((error as Error)?.message || 'Failed to create nursing note');
    }
  }

  @Get('recent/:patientId')
  async getRecentNotes(
    @Param('patientId') patientId: string,
    @Query('limit') limit?: string
  ): Promise<object> {
    try {
      const notes = await this.nursingNoteService.getRecentNotes(
        patientId,
        limit ? parseInt(limit, 10) : 10
      );
      return { success: true, data: notes };
    } catch (error: unknown) {
      throw new BadRequestException((error as Error)?.message || 'Failed to fetch recent notes');
    }
  }

  @Get(':noteId')
  async getNoteById(
    @Param('noteId') noteId: string
  ): Promise<object> {
    try {
      const note = await this.nursingNoteService.getNoteById(noteId);
      if (!note) {
        throw new NotFoundException('Note not found');
      }
      return { success: true, data: note };
    } catch (error: unknown) {
      if ((error as any)?.status === 404) {
        throw error;
      }
      throw new BadRequestException((error as Error)?.message || 'Failed to fetch note');
    }
  }

  // Delete endpoint removed: NursingNoteService does not implement deleteNote. Implement if needed.
}
