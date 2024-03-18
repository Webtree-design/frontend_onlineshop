import { DataService } from 'src/app/services/data.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  BehaviorSubject,
  forkJoin,
  fromEvent,
  Observable,
  Subject,
} from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  searchbarValue: string = '';
  selectedBrand: string = '';
  selectedModell: string = '';
  selectedMotor: string = '';

  hideArrow: string = 'hideArrow';

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  onBrandChange(): void {
    this.searchbarValue = '';
    this.selectedModell = '';
    this.selectedMotor = '';
  }
  onBrandReset() {
    this.selectedBrand = '';
    this.selectedModell = '';
    this.selectedMotor = '';
  }
  onModellChange(): void {
    this.searchbarValue = '';
    this.selectedMotor = '';
  }
  onModellReset() {
    this.selectedModell = '';
    this.selectedMotor = '';
  }
  onMotorChange(): void {
    this.searchbarValue = '';
  }
  onMotorReset() {
    this.selectedMotor = '';
  }

  submitFilter() {
    console.log(this.selectedBrand);
    this.currentPage = 0;
    this.pageSize = 25;
    this.getData();
  }

  clearFilter() {
    this.searchbarValue = '';
    this.selectedBrand = '';
    this.selectedModell = '';
    this.selectedMotor = '';
    this.currentPage = 0;
    this.pageSize = 25;
    this.getData();
  }

  ///////////////////////////

  private isBrowser: boolean = false;
  obsArray: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  items$: Observable<any> = this.obsArray.asObservable();
  currentPage: number = 0;
  pageSize: number = 25;

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private dataService: DataService,
    public snackBar: MatSnackBar
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  public openSnackBar(message: string) {
    let config = new MatSnackBarConfig();
    config.panelClass = ['custom-snackbar'];
    config.horizontalPosition = 'start';
    config.verticalPosition = 'bottom';
    config.duration = 2000;
    this.snackBar.open(message, '', config);
  }

  async ngOnInit() {
    await this.getConfig();
    await this.getData();
  }

  private destroy$: Subject<void> = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public filter: any = {};

  private async getConfig() {
    const data = await this.dataService.getConfig();
    this.filter = data.filter;
    console.log(data.filter);
  }

  private async getData() {
    if (this.isBrowser) {
      this.dataService
        .getData(
          this.currentPage,
          this.pageSize,
          this.selectedBrand,
          this.selectedModell,
          this.selectedMotor,
          this.searchbarValue
        )
        .subscribe((data: any) => {
          this.obsArray.next(data);
        });

      const content = document.querySelector('.items');
      const scroll$ = fromEvent(content!, 'scroll').pipe(
        map(() => {
          // console.log('# ' + content!.scrollTop);
          return content!.scrollTop;
        })
      );

      scroll$.pipe(takeUntil(this.destroy$)).subscribe((scrollPos) => {
        let limit = content!.scrollHeight - content!.clientHeight;
        if (scrollPos === limit) {
          this.currentPage += this.pageSize;
          forkJoin([
            this.items$.pipe(take(1)),
            this.dataService.getData(
              this.currentPage,
              this.pageSize,
              this.selectedBrand,
              this.selectedModell,
              this.selectedMotor,
              this.searchbarValue
            ),
          ]).subscribe((data: Array<Array<any>>) => {
            const newArr = [...data[0], ...data[1]];
            this.obsArray.next(newArr);
          });
        }
      });
    }
  }

  openDetails(item: any) {}

  submitFilterSearchbar(searchbarValue: any) {
    // if (!searchbarValue) return;
    this.currentPage = 0;
    this.pageSize = 25;
    this.searchbarValue = searchbarValue + '';
    console.log(this.searchbarValue);
    this.getData();
  }

  addToCard(item: any) {
    this.openSnackBar(item.title + ' wurde zum Warenkorb hinzugefügt');
    this.dataService.addToCard(item);
  }
}
