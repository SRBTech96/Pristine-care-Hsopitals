// backend/src/controllers/NursingNoteController.ts
import { Request, Response } from 'express';
import { NursingNoteService } from '../services/NursingNoteService';

export class NursingNoteController {
  constructor(private nursingNoteService: NursingNoteService) {}

  async createNote(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, wardId, noteType, content, soapData } = req.body;
      const userId = req.user.id;

      const note = await this.nursingNoteService.createNote({
        patientId,
        wardId,
        nurseId: userId,
        noteType,
        content,
        soapData,
      });

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateNote(req: Request, res: Response): Promise<void> {
    try {
      const { noteId } = req.params;
      const { content, soapData } = req.body;
      const userId = req.user.id;

      const note = await this.nursingNoteService.updateNote(
        noteId,
        { content, soapData },
        userId
      );

      res.status(200).json({
        success: true,
        data: note,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getNotesByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const notes = await this.nursingNoteService.getNotesByPatient(
        patientId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getNotesByNurse(req: Request, res: Response): Promise<void> {
    try {
      const { nurseId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const notes = await this.nursingNoteService.getNotesByNurse(
        nurseId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getNotesByWard(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const notes = await this.nursingNoteService.getNotesByWard(
        wardId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getRecentNotes(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { limit = 20 } = req.query;

      const notes = await this.nursingNoteService.getRecentNotes(
        wardId,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getNoteById(req: Request, res: Response): Promise<void> {
    try {
      const { noteId } = req.params;

      const note = await this.nursingNoteService.getNoteById(noteId);

      if (!note) {
        res.status(404).json({
          success: false,
          error: 'Note not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: note,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const { noteId } = req.params;
      const userId = req.user.id;

      // Soft delete with audit log
      const note = await this.nursingNoteService.deleteNote(noteId, userId);

      res.status(200).json({
        success: true,
        message: 'Note deleted',
        data: note,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
