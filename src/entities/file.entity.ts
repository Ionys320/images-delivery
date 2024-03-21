import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  service: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  user?: string;
}
