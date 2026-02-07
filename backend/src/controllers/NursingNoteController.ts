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
  Request,
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
    @Request() req: any,
  ): Promise<any> {
    try {
      const { patientId, wardId, noteType, content, soapData } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const note = await this.nursingNoteService.createNote({
        patientId,
        wardId,
        nurseId: userId,
        noteType,
        content,
        soapData,
      });

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
    @Request() req: any,
  ): Promise<any> {
    try {
      const { content, soapData } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const note = await this.nursingNoteService.updateNote(
        noteId,
        { content, soapData },
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByPatient(
        patientId,
        parseInt(limit || '50', 10),
        parseInt(offset || '0', 10),
      );

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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByNurse(
        nurseId,
        parseInt(limit || '100', 10),
        parseInt(offset || '0', 10),
      );

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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getNotesByWard(
        wardId,
        parseInt(limit || '100', 10),
        parseInt(offset || '0', 10),
      );

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

  @Get('ward/:wardId/recent')
  async getRecentNotes(
    @Param('wardId') wardId: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    try {
      const notes = await this.nursingNoteService.getRecentNotes(
        wardId,
        parseInt(limit || '20', 10),
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
    @Request() req: any,
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
