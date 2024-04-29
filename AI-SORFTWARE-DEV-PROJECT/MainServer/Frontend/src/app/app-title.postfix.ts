import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable()
export class AppTitlePostfix extends TitleStrategy {
    updateTitle(snapshot: RouterStateSnapshot): void {
        const title = this.buildTitle(snapshot);
        if (title) {
            this.title.setTitle(`${title} - FactTrack`);
        }
    }
    constructor(private readonly title: Title) {
        super();
    }
}