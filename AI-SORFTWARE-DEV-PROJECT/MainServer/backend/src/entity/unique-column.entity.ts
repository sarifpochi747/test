import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Organization } from "./organization.entity";
import { UniqueData } from "./unique-data.entity";

@Entity("unique_column")
export class UniqueColumn {


    @PrimaryGeneratedColumn("uuid")
    uniqColId: string;

    @Column({ type: 'varchar', length: 100 })
    uniqColName: string;

    @ManyToOne(()=>Organization,(organization)=>organization.uniqueColumn)
    @JoinColumn({name:"organizationId"})
    organization:Organization;
    
    @OneToMany(() => UniqueData, (UniqueData) => UniqueData.uniqueColumn)
    uniqueData: UniqueData[];

}