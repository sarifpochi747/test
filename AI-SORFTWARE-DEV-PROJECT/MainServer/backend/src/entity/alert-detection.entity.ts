import { Entity,Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { ImageCapture } from "./image-capture.entity";
import { Alert } from "./alert.entity";

@Entity("alert_detection")
export class AlertDetection{

    @PrimaryGeneratedColumn({ type: 'bigint' })
    alertDetectionId:number;
    
    @Column({ type: 'varchar', length: 100 })
    facePosition:string;

    @ManyToOne(()=>ImageCapture,(ImageCapture)=>ImageCapture.detections , { nullable: false })
    @JoinColumn({name:"imageCaptureId"})
    imageCapture:ImageCapture 

    @ManyToOne(()=>Alert,(alert)=>alert.AlertDetection , { nullable: false })
    @JoinColumn({name:"alertId"})
    Alert:Alert 
    
}