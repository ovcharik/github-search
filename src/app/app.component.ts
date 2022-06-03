import { Subject, BehaviorSubject } from 'rxjs';
import { combineLatest, takeUntil, map } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { SearchRepositoriesParams } from './github.service';
import { SearchRepositoryChip } from './repositories.service';
import { RepositoriesService } from './repositories.service';

type SortParams = {
  sort?: SearchRepositoriesParams['sort'];
  order?: SearchRepositoriesParams['order'];
};

type PageParams = {
  page: number;
  per_page: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  destroy$ = new Subject<void>();

  search$ = new BehaviorSubject<string>('topic:angular');
  sort$ = new BehaviorSubject<SortParams>({ sort: 'stars', order: 'desc' });
  page$ = new BehaviorSubject<PageParams>({ page: 1, per_page: 5 });

  params$ = combineLatest([this.search$, this.sort$, this.page$]).pipe(
    map(([q, sort, page]) => ({ q, ...sort, ...page }))
  );

  count$ = this.repositories.count$;
  chips$ = this.repositories.chips$;

  constructor(protected repositories: RepositoriesService) {
    this.params$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.repositories.search(params);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setSort({ active, direction: order }: Sort) {
    const sort = active as SearchRepositoriesParams['sort'];
    const sortParams = order ? { sort, order } : {};
    this.sort$.next(sortParams);
  }

  setSearch(search: string | void) {
    this.search$.next(search ?? '');
  }

  setPage(event: PageEvent) {
    this.page$.next({
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    });
  }

  removeChip(chip: SearchRepositoryChip) {
    const { type } = chip;
    if (type === 'reset' || type === 'search') {
      this.search$.next('');
    }
    if (type === 'reset' || type === 'sort') {
      this.sort$.next({});
    }
    if (type === 'reset' || type === 'page') {
      this.page$.next({ page: 1, per_page: chip.per_page });
    }
  }
}
