import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
let env = (require('dotenv').config()).parsed

const config = {
    type: "postgres",
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    username: env.DB_USER,
    password: env.DB_PW,
    database: env.DB_DBNAME,
    entities: ["dist/src/entity/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);