import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { Product } from './models/Product';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend_onlineshop';
  products: any[] = [];

  constructor(private dataService: DataService) {}

  // ngOnInit() {
  //   this.getProducts();
  // }

  // async getProducts() {
  //   const data = await this.dataService.getProducts();
  //   this.products = data;
  // }
}
