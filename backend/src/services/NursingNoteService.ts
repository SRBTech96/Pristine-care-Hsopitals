// backend/src/services/NursingNoteService.ts
import { Repository } from 'typeorm';
import { NursingNote, NoteFormat } from '../entities/NursingNote';

export interface CreateNursingNoteDTO {
  patientId: string;
  wardId: string;
  nurseId: string;
  format: NoteFormat;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  content?: string;
  category?: string;
}

export interface UpdateNursingNoteDTO {
  noteId: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  content?: string;
}

export class NursingNoteService {
  constructor(private noteRepository: Repository<NursingNote>) {}

  private logAudit(message: string, userId: string): string {
    return JSON.stringify({
      timestamp: new Date(),
      userId,
      message,
    });
  }

  async createNote(dto: CreateNursingNoteDTO, userId: string): Promise<NursingNote> {
    const note = new NursingNote();
    note.patientId = dto.patientId;
    note.wardId = dto.wardId;
    note.nurseId = dto.nurseId;
    note.format = dto.format;

    if (dto.format === NoteFormat.SOAP) {
      note.subjective = dto.subjective ?? '';
      note.objective = dto.objective ?? '';
      note.assessment = dto.assessment ?? '';
      note.plan = dto.plan ?? '';
      note.content = '';
      note.category = '';
    } else {
      note.content = dto.content ?? '';
      note.category = dto.category ?? '';
      note.subjective = '';
      note.objective = '';
      note.assessment = '';
      note.plan = '';
    }

    note.auditLog = this.logAudit('Note created', userId);

    return this.noteRepository.save(note);
  }

  async updateNote(dto: UpdateNursingNoteDTO, userId: string): Promise<NursingNote> {
    const note = await this.noteRepository.findOne({
      where: { id: dto.noteId },
    });

    if (!note) {
      throw new Error('Nursing note not found');
    }

    // Update only provided fields
    if (dto.subjective !== undefined) note.subjective = dto.subjective;
    if (dto.objective !== undefined) note.objective = dto.objective;
    if (dto.assessment !== undefined) note.assessment = dto.assessment;
    if (dto.plan !== undefined) note.plan = dto.plan;
    if (dto.content !== undefined) note.content = dto.content;

    note.auditLog = (note.auditLog || '') + '\n' + this.logAudit('Note updated', userId);

    return this.noteRepository.save(note);
  }

  async getNotesByPatient(patientId: string): Promise<NursingNote[]> {
    return this.noteRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      relations: ['nurse'],
    });
  }

  async getNotesByNurse(nurseId: string): Promise<NursingNote[]> {
    return this.noteRepository.find({
      where: { nurseId },
      order: { createdAt: 'DESC' },
    });
  }

  async getNotesByWard(wardId: string): Promise<NursingNote[]> {
    return this.noteRepository.find({
      where: { wardId },
      order: { createdAt: 'DESC' },
      relations: ['patient', 'nurse'],
    });
  }

  async getNoteById(id: string): Promise<NursingNote | null> {
    return this.noteRepository.findOne({
      where: { id },
      relations: ['patient', 'nurse'],
    });
  }

  async getNotesByCategory(wardId: string, category: string): Promise<NursingNote[]> {
    return this.noteRepository.find({
      where: { wardId, category },
      order: { createdAt: 'DESC' },
      relations: ['patient', 'nurse'],
    });
  }

  async getRecentNotes(patientId: string, limit: number = 10): Promise<NursingNote[]> {
    return this.noteRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['nurse'],
    });
  }
}
