import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Embedded } from './embedded.entity';
import { Status } from 'src/declarations/status';
import { UniqueData } from './unique-data.entity';

@Entity("employee")
export class Employee {


    @PrimaryGeneratedColumn("uuid")
    employeeId: string;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 15 })
    phone: string;

    @Column({ length: 10 })
    gender: string;

    @Column({ length: 100 })
    address: string;

    @Column({ type: 'date' })
    birthday: Date; // Use the 'Date' type for the birthday

    @Column({ type: "varchar", default: Status.ACTIVE })
    status: Status;

    @Column({ type: 'varchar' })
    profileImage: string;

    @ManyToOne(() => Organization, (org) => org.employees, { nullable: false })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @OneToMany(() => Embedded, (embedded) => embedded.employee)
    embeddeds: Embedded[];

    @OneToMany(() => UniqueData, (UniqueData) => UniqueData.employee)
    uniqueData: UniqueData[];
}