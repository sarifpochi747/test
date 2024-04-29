import { BadRequestException, Injectable,NotFoundException } from '@nestjs/common';
import { SystemAdmin } from 'src/entity/system-admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SystemAdminService {
    private saltOrRounds = 10;


    constructor(
        @InjectRepository(SystemAdmin)
        private systemAdminRepository:Repository<SystemAdmin>,
    ){}

    async createSystemAdmin(regSystemAdmin:RequestRegister) : Promise<void>{

        // Check for null values in organization data fields
        const requiredFields = [ 'email',  'password'];

        for (const field of requiredFields) {
            const fieldValue = regSystemAdmin[field]?.trim(); // Use optional chaining to handle potential null or undefined
            if (!fieldValue)  throw new NotFoundException(`${field} is null, undefined, or empty`);
        }

        //check email is exist 
        
        // Check if email already exists
        if (await this.systemAdminRepository.existsBy({ email: regSystemAdmin.email })) {
            throw new BadRequestException("Email already exists");
        }


        //create hash password
        const hashPassword = await bcrypt.hash(regSystemAdmin.password,this.saltOrRounds)


        //create and save the systemadmin object
        const systemAdmin = this.systemAdminRepository.create({
            email:regSystemAdmin.email,
            password:hashPassword
        })

        await this.systemAdminRepository.save(systemAdmin)

    }


    async findById(id:string):Promise<SystemAdmin | undefined>{
        return await this.systemAdminRepository.findOneBy({systemAdminId:id})
    }

    async findByEmail(email:string):Promise<SystemAdmin | undefined>{
        return this.systemAdminRepository.findOneBy({email:email})
    }
    
    async deleteById(id:string):Promise<void>{
        await this.systemAdminRepository.delete(id);
    }

}
