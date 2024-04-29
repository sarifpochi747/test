import { Entity,Column, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Embedded } from "./embedded.entity";
import { ImageCapture } from "./image-capture.entity";


@Entity("detection")
export class Detection{

    @PrimaryGeneratedColumn({ type: 'bigint' })
    detectId:number;
    
    @Column({ type: 'varchar', length: 100 })
    facePosition:string;

    @Column({ type: 'text' })
    embedding:string;

    @Column({ type: 'varchar', length: 100 , nullable: true})
    gender:string;

    @Column({ type: 'varchar', length: 100 , nullable: true})
    age:string;

    @Column({ type: 'varchar', length: 100 , nullable: true})
    emotion:string;

    @ManyToOne(()=>Embedded,(embedded)=>embedded.detections , { nullable: true })
    @JoinColumn({name:"embeddedId"})
    embedded:Embedded | null;

    @ManyToOne(()=>ImageCapture,(imgCap)=>imgCap.detections , { nullable: false })
    @JoinColumn({name:"imageCaptureId"})
    imageCapture:ImageCapture 
}