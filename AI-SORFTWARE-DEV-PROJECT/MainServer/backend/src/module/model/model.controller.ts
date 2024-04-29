import { Body, Controller,HttpStatus,Post,UseGuards,Get, BadRequestException } from '@nestjs/common';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
import { ModelService } from './model.service';
import { ModelDTO } from './dto/model.dto';
import { RolesGuard } from 'src/guard/Roles.guard';
import { Role, Roles } from 'src/decorator/roles.decorator';



@ApiTags('Model')
@UseGuards(RolesGuard)
@Controller('')
export class ModelController {

    constructor(
        private modelService:ModelService
    ){}

    
    @ApiOperation({ summary: 'Add Model', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/create")
    async createModel(@Body() requestModel:ModelDTO):Promise<ApiResponse>{
        try {

            await this.modelService.createModel(requestModel);
            return{
                message:"add model success",
                statusCode:HttpStatus.CREATED
            }
        } catch (error) {
            throw error
            
        }
    }

    @ApiOperation({ summary: 'Get All Model(AI)', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Get()
    async getAllModels(): Promise<ApiResponse> {
        try {
            const models = this.modelService.getAllModel();
            return {
                message :"Success",
                statusCode:HttpStatus.OK,
                data:models
            }
        } catch (error) {
            throw error
        }
    }




}