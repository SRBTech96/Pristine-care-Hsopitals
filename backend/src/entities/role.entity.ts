import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz', name: 'created_at', nullable: true })
  createdAt?: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt?: Date;
}
