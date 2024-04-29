import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Organization } from "./organization.entity";


@Entity("model")
export class Model {

    @PrimaryGeneratedColumn("uuid")
    modelId: string;


    @Column({ type: 'varchar', length: 100 })
    modelFile: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateInstall: Date;
    

    @ManyToOne(() => Organization, (org) => org.models, { nullable: false })
    @JoinColumn({ name: "organizationId" })
    organization: Organization;
}