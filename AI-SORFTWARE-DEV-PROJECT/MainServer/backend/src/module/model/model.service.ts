import { BadRequestException, Injectable } from '@nestjs/common';
import { ModelDTO } from './dto/model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/entity/model.enitity';
import { Repository } from 'typeorm';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class ModelService {



    constructor(@InjectRepository(Model)
        private modelRepository:Repository<Model>,
        private organizationService:OrganizationService
    ){}

    async createModel(requestModel:ModelDTO):Promise<void>{

        //check for null values in model data fields
        const requiredFields =  ["modelFile","dateInstall","organizationId"]
        for(const field of requiredFields){
            const fieldValue = requestModel[field]?.trim();
            if(!fieldValue){
                throw new BadRequestException(`${field} is null, undefined, or empty`);
            }
        }

        // If all required fields are present, proceed with creating the employee
        const organization = await this.organizationService.findById(requestModel.organizationId);

        const model = this.modelRepository.create({
            modelFile: requestModel.modelFile,
            dateInstall:requestModel.dateInstall,
            organization:organization
        })


        await this.modelRepository.save(model)

    }

    async getAllModel():Promise<Model[]>{
        return await this.modelRepository.find();
    }


}
