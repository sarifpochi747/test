import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Employee } from './employee.entity';
import { Camera } from './camera.entity';
import { Model } from './model.enitity';
import { Greeting } from './greeting.entity';
import { UniqueColumn } from './unique-column.entity';
import { Status } from 'src/declarations/status';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  organizationName: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', default: Status.ACTIVE })
  organizeStatus: Status;

  @OneToMany(() => Employee, (employee) => employee.organization)
  employees: Employee[];

  @OneToMany(() => Camera, (camera) => camera.organization)
  cameras: Camera[];

  @OneToMany(() => Model, (model) => model.organization)
  models: Model[];

  @OneToMany(() => Greeting, (greeting) => greeting.organization)
  greetings: Greeting[];

  @OneToMany(() => UniqueColumn, (UniqueColumn) => UniqueColumn.organization)
  uniqueColumn: UniqueColumn[];
}