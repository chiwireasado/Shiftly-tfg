import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-info',
  imports: [CommonModule, RouterModule],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {

}
