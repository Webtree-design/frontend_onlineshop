import { DataService } from 'src/app/services/data.service';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, fromEvent, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  products: any[] = [];

  obsArray: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  items$: Observable<any> = this.obsArray.asObservable();
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getData();
  }

  private getData() {
    this.dataService
      .getData(this.currentPage, this.pageSize)
      .subscribe((data: any) => {
        this.obsArray.next(data);
      });

    const content = document.querySelector('.items');
    const scroll$ = fromEvent(content!, 'scroll').pipe(
      map(() => {
        return content!.scrollTop;
      })
    );

    scroll$.subscribe((scrollPos) => {
      let limit = content!.scrollHeight - content!.clientHeight;
      if (scrollPos === limit) {
        this.currentPage += this.pageSize;
        forkJoin([
          this.items$.pipe(take(1)),
          this.dataService.getData(this.currentPage, this.pageSize),
        ]).subscribe((data: Array<Array<any>>) => {
          const newArr = [...data[0], ...data[1]];
          this.obsArray.next(newArr);
        });
      }
    });
  }
}
