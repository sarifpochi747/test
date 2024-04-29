import { Entity, PrimaryGeneratedColumn,Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Organization } from "./organization.entity";
import { AlertDetection } from "./alert-detection.entity";

@Entity("alert")
export class Alert{

    @PrimaryGeneratedColumn({ type: 'bigint' })
    alertId:number;

    @Column({ type: 'varchar', length: 100 }) 
    alertName:string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timeStamp: Date;

    @Column({ type: "text" })
    embedding: string;

    @Column({ type: "varchar" })
    imgFile: string;

    @OneToMany(()=>AlertDetection,(alertDetection)=>alertDetection.Alert)
    AlertDetection:AlertDetection[];

    @ManyToOne(()=>Organization,(org)=>org.cameras , { nullable: false })
    @JoinColumn({name:"organizationId"})
    organization:Organization;

}   