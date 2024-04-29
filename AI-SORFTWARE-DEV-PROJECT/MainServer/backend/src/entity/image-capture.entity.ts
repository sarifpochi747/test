import { Entity, PrimaryGeneratedColumn,Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from "typeorm";
import { Detection } from "./detection.entity";
import { Camera } from "./camera.entity";


@Entity("image_capture")
export class ImageCapture{

    @PrimaryGeneratedColumn({ type: 'bigint' })
    imgCapId:number;


    @Column({ type: 'text'}) 
    imgFile:string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timeStamp: Date;

    @ManyToOne(()=>Camera,(camera)=>camera.imageCapture , { nullable: false })
    @JoinColumn({name:"cameraId"})
    camera:Camera;

    @OneToMany(()=>Detection,(detection)=>detection.imageCapture)
    detections?:Detection[];
}