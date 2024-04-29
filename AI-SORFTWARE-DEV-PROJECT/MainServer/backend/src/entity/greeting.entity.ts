import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Organization } from "./organization.entity";



@Entity("greeting")
export class Greeting {


    @PrimaryGeneratedColumn({ type: 'bigint' })
    greetingId: number;


    @Column({ type: "varchar" })
    message: string;

    @Column({ type: "varchar", nullable: true })
    emotion: 'happy' | 'surprise' | 'surprise' | 'sad' | 'fear' | 'disgust' | 'angry' | 'neutral';

    @ManyToOne(() => Organization, (organization) => organization.greetings)
    @JoinColumn({ name: "organizationId" })
    organization: Organization;

}