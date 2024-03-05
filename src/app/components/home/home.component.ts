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
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  searchValue: string = '';
  selectedBrand: string = '';
  selectedModell: string = '';
  selectedMotor: string = '';

  //   'BMW Motorcycles': {
  //     'R 1100 (01.1993 - 12.2005)': [
  //       'R 1100 GS (R259) (57 kW / 78 PS) (01.1993 - 12.1999) 1085ccm',
  //       'R 1100 GS (R259) (59 kW / 80 PS) (01.1993 - 12.1999) 1085ccm',
  //       'R 1100 R (R259) (57 kW / 78 PS) (01.1993 - 12.1999) 1085ccm',
  //     ],
  //     'R 1150 (09.1998 - ...)': [
  //       'R 1150 (62 kW / 85 PS) (01.2002 - 12.2010) 1130ccm',
  //       'R 1150 GS (R21) (62 kW / 85 PS) (09.1998 - 12.2003) 1130ccm',
  //       'R 1150 GS Adventure (R21) (62 kW / 85 PS) (01.2002 - 12.2005) 1130ccm',
  //     ],
  //     'R 1200 (07.1997 - ...)': [
  //       'R 1200 C (259C) (45 kW / 61 PS) (07.1997 - 12.2004) 1170ccm',
  //       'R 1200 C Avantgarde (259C) (45 kW / 61 PS) (09.1998 - 12.2003) 1170ccm',
  //       'R 1200 C Classic (259C) (45 kW / 61 PS) (01.2001 - 12.2004) 1170ccm',
  //     ],
  //   },
  //   'HARLEY-DAVIDSON MC': {
  //     'SPORTSTER (01.1978 - ...)': [
  //       '1000 Sportster (XLCH) (44 kW / 60 PS) (01.1978 - 12.1985) 998ccm',
  //       '1000 Sportster (XLH) (36 kW / 49 PS) (01.1978 - 12.1985) 998ccm',
  //       '1000 Sportster (XLX) (36 kW / 49 PS) (01.1983 - 12.1985) 998ccm',
  //     ],
  //     'ROAD KING (01.1994 - ...)': [
  //       '1340 Road King (FLHR) (36 kW / 49 PS) (01.1994 - 12.1998) 1338ccm',
  //       '1340 Road King Classic (FLHRCI) (44 kW / 60 PS) (01.1998 - 12.1998) 1338ccmv',
  //       '1450 Road King (49 kW / 67 PS) (01.1999 - 12.2002) 1449ccm',
  //     ],
  //     'DYNA (01.1979 - ...)': [
  //       '1340 Dyna Disc Glide (FXRDG) (47 kW / 64 PS) (01.1984 - 12.1984) 1338ccm',
  //       '1340 Dyna Fat Bob (FXEF) (47 kW / 64 PS) (01.1985 - 12.1985) 1338ccm',
  //       '1340 Dyna Fat Bob (FXEF) (49 kW / 67 PS) (01.1979 - 12.1983) 1338ccm',
  //     ],
  //   },
  //   'KREIDLER Motorcycles': {
  //     'FLORETT (01.1981 - ...)': [
  //       'Florett 125 (6 kW / 8 PS) (01.2006 - 12.2008) 125ccm',
  //       'Florett 50 DD (3 kW / 4 PS) (01.2012 - ...) 49ccm',
  //       'Florett 50 Race (3 kW / 4 PS) (01.2008 - ...) 49ccm',
  //     ],
  //     'HIKER (01.2009 - ...)': [
  //       'Hiker 125 DD (7 kW / 10 PS) (01.2009 - ...) 125ccm',
  //       'Hiker 50 DD (2 kW / 3 PS) (01.2009 - ...) 49ccm',
  //     ],
  //   },
  // };

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  onBrandChange(): void {
    this.selectedModell = '';
    this.selectedMotor = '';
  }

  onModellChange(): void {
    this.selectedMotor = '';
  }

  submitFilter() {
    this.currentPage = 0;
    this.pageSize = 25;
    this.getData();
  }

  clearFilter() {
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
    private dataService: DataService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
          this.selectedMotor
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
              this.selectedMotor
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

  filterSearchbar(searchValue: any) {
    if (!searchValue) return;
    console.log(searchValue);
  }
  openFilter() {
    console.log('openFilter()');
  }
}
