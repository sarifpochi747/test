import { Component, } from '@angular/core';
import { LoadingService } from './loading-transition.service';

@Component({
  selector: 'loading-transition',
  templateUrl: './loading-transition.component.html',
  styleUrls: ['./loading-transition.component.css']
})
export class LoadingComponent {
  constructor(public readonly loadingService: LoadingService){}
}