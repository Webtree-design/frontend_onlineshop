import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom, map, shareReplay } from 'rxjs';
import { Product } from '../models/Product';
import { CookieService } from './cookie.service';
import { env } from '../env';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = env.apiUrl;
  private headers: any;
  private params: any;
  private products: any[] = [];

  constructor(private cookieService: CookieService, private http: HttpClient) {
    this.setHeaders();
  }

  public async setHeaders() {
    console.log('setHeaders()');
    // const cookie = await this.cookieService.get('token');
    const cookie = '123123123123123';
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authorization: `${cookie}`,
    });
    this.params = new HttpParams().set('kunde', env.customer);
  }

  public getData(pageNumber: number, pageSize: number) {
    return this.http.get<any>(
      `${this.apiUrl}/products/get?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: this.headers,
        params: this.params,
      }
    );
  }
}

// public async getProducts(pageNumber: number, pageSize: number) {
//   await this.setHeaders();
//   console.log('getProductsAll()');
//   try {
//     const response = this.http.get<any>(
//       `${this.apiUrl}/products/get?pageNumber=${pageNumber}&pageSize=${pageSize}`,
//       {
//         headers: this.headers,
//         params: this.params,
//       }
//     );
//     return firstValueFrom(response);
//   } catch (error) {
//     console.error('Error fetching data product:', error);
//   }
// }
