// http.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HttpService {
    private readonly axiosInstance = axios.create({
        baseURL: process.env.PYTHON_HOST,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    async get(path: string): Promise<any> {
        try {
            const response = await this.axiosInstance.get(path);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post(path: string, body: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post(path, body, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}
