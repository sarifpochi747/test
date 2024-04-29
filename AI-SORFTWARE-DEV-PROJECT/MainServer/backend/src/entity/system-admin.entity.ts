import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("system_admin")
export class SystemAdmin {

    @PrimaryGeneratedColumn("uuid")
    systemAdminId: string;

    @Column({ type: 'varchar', length: 100 })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    password: string;

}