// backend/src/controllers/NursingNoteController.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NursingNoteService } from '../services/NursingNoteService';

@Controller('nursing-notes')
export class NursingNoteController {
  constructor(private nursingNoteService: NursingNoteService) {}

  @Post()
  @HttpCode(201)
  async createNote(
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const {
        patientId,
        wardId,
        format,
        subjective,
        objective,
        assessment,
        plan,
        content,
        category,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const note = await this.nursingNoteService.createNote(
        {
          patientId,
          wardId,
          nurseId: userId,
          format,
          subjective,
          objective,
          assessment,
          plan,
          content,
          category,
        },
        userId,
      );

      return {
        success: true,
        data: note,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to create nursing note',
      );
    }
  }

  @Put(':noteId')
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const {
        subjective,
        objective,
        assessment,
        plan,
        content,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const note = await this.nursingNoteService.updateNote(
        {
          noteId,
          subjective,
          objective,
          assessment,
          plan,
          content,
        },
        userId,
      );

      return {
        success: true,
        data: note,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to update nursing note',
      );
    }
  }

  @Get('patient/:patientId')
  async getNotesByPatient(
    @Param('patientId') patientId: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByPatient(patientId);

      return {
        success: true,
        data: notes,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch notes',
      );
    }
  }

  @Get('nurse/:nurseId')
  async getNotesByNurse(
    @Param('nurseId') nurseId: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByNurse(nurseId);

      return {
        success: true,
        data: notes,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch notes',
      );
    }
  }

  @Get('ward/:wardId')
  async getNotesByWard(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByWard(wardIdcatch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch notes',
      );
    }
  }

  @Get('recent/:patientId')
  async getRecentNotes(
    @Param('patientId') patientId: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getRecentNotes(
        patientId,
        parseInt(limit || '10', 10),
      );

      return {
        success: true,
        data: notes,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch recent notes',
      );
    }
  }

  @Get(':noteId')
  async getNoteById(
    @Param('noteId') noteId: string,
  ): Promise<any> {
    try {
      const note = await this.nursingNoteService.getNoteById(noteId);

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      return {
        success: true,
        data: note,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || 'Failed to fetch note',
      );
    }
  }

  @Delete(':noteId')
  async deleteNote(
    @Param('noteId') noteId: string,
    @Req() req: any,
  ): Promise<any> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const note = await this.nursingNoteService.deleteNote(noteId, userId);

      return {
        success: true,
        message: 'Note deleted',
        data: note,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to delete note',
      );
    }
  }
}
