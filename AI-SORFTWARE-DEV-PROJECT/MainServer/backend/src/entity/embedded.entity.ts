import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Employee } from "./employee.entity";
import { Detection } from "./detection.entity";


@Entity("embedded")
export class Embedded {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    embeddedId: number;


    @Column({ type: "varchar" })
    embedding: string;

    @ManyToOne(() => Employee, (emp: Employee) => emp.embeddeds, { nullable: false })
    @JoinColumn({ name: "employeeId" })
    employee: Employee;

    @OneToMany(() => Detection, (detection: Detection) => detection.embedded)
    detections: Detection[];
}