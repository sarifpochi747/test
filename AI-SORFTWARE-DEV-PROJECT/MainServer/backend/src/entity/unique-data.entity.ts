import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UniqueColumn } from "./unique-column.entity";
import { Employee } from "./employee.entity";


@Entity("unique_data")
export class UniqueData {

    @PrimaryGeneratedColumn("uuid")
    uniqDataId: string;

    @Column({ type: 'varchar' })
    uniqColData: string;

    @ManyToOne(() => UniqueColumn, (UniqueColumn) => UniqueColumn.uniqueData, { nullable: false })
    @JoinColumn({ name: "uniqColId" })
    uniqueColumn: UniqueColumn;

    @ManyToOne(() => Employee, (Employee) => Employee.uniqueData, { nullable: false })
    @JoinColumn({ name: "employeeId" })
    employee: Employee;
}
