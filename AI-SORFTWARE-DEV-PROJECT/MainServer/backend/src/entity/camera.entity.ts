import { Entity, PrimaryGeneratedColumn,Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Organization } from "./organization.entity";
import { ImageCapture } from "./image-capture.entity";
import { Status } from "src/declarations/status";

@Entity("camera")
export class Camera{

    @PrimaryGeneratedColumn("uuid")
    cameraId:string;

    @Column({ type: 'varchar', length: 100 }) 
    cameraName:string;

    @Column({ type: 'varchar',length:100})
    cameraDetail:string

    
    @Column({ type: 'varchar',length:100})
    cameraSpec:string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateInstall:Date;

    @Column({ type: 'varchar', default: Status.ACTIVE })
    status: string;
    
    @ManyToOne(()=>Organization,(org)=>org.cameras , { nullable: false })
    @JoinColumn({name:"organizationId"})
    organization:Organization;

    @OneToMany(()=>ImageCapture,(imgCap)=>imgCap.camera)
    imageCapture:ImageCapture[];
}   