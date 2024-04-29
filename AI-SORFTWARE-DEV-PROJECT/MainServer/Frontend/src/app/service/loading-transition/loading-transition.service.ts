import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoadingService{
    private loadingState: boolean = false;

    public setLoadingState(loadingState: boolean): void{
        this.loadingState = loadingState;
    }

    public getLoadingState(): boolean{
        return this.loadingState;
    }
}