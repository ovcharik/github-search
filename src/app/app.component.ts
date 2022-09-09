import { Subject, BehaviorSubject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, scan, map } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { SearchRepositoriesParams } from './github.service';
import { SearchRepositoryChip } from './repositories.service';
import { RepositoriesService } from './repositories.service';
import { ActivatedRoute, Router } from '@angular/router';

const searchParamsKeys: Array<keyof SearchRepositoriesParams> = [
  'sort',
  'order',
  'page',
  'per_page',
  'q',
];

const fillSearchParamsWithDefault = (params: SearchRepositoriesParams) => {
  const defaultParams = Object.fromEntries(
    searchParamsKeys.map((key) => [key, undefined])
  );
  return { ...defaultParams, ...params };
};

const searchParamsIsEqual = (
  a: SearchRepositoriesParams,
  b: SearchRepositoriesParams
) => {
  return searchParamsKeys.every((key) => a[key] === b[key]);
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  destroy$ = new Subject<void>();

  private searchInputUpdater$ = new Subject<string>();

  private localParams$ = new BehaviorSubject<SearchRepositoriesParams>({});
  private queryParams$ = this.activatedRouter.queryParams.pipe(
    map(fillSearchParamsWithDefault),
    distinctUntilChanged(searchParamsIsEqual)
  );

  private params$ = merge(this.localParams$, this.queryParams$).pipe(
    scan((acc, value) => ({ ...acc, ...value }), {}),
    debounceTime(0),
    distinctUntilChanged(searchParamsIsEqual)
  );

  search$ = this.params$.pipe(map(({ q }) => q));
  sort$ = this.params$.pipe(map(({ sort, order }) => ({ sort, order })));
  page$ = this.params$.pipe(
    map(({ page, per_page }) => ({ page: page ?? 1, per_page }))
  );

  count$ = this.repositories.count$;
  chips$ = this.repositories.chips$;

  constructor(
    protected repositories: RepositoriesService,
    protected activatedRouter: ActivatedRoute,
    protected router: Router
  ) {
    this.searchInputUpdater$
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe((searchInput) => {
        this.updateLocalParams({ q: searchInput });
      });

    this.params$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.router.navigate([], {
        relativeTo: this.activatedRouter,
        queryParams: params,
        queryParamsHandling: 'merge',
      });
      this.repositories.search(params);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setSort({ active, direction: order }: Sort) {
    const sort = active as SearchRepositoriesParams['sort'];
    const sortParams = order
      ? { sort, order }
      : { sort: undefined, order: undefined };
    this.updateLocalParams(sortParams);
  }

  setSearch(search: string | void) {
    this.searchInputUpdater$.next(search ?? '');
  }

  setPage(event: PageEvent) {
    this.updateLocalParams({
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    });
  }

  removeChip(chip: SearchRepositoryChip) {
    const { type } = chip;
    if (type === 'reset' || type === 'search') {
      this.updateLocalParams({ q: '' });
    }
    if (type === 'reset' || type === 'sort') {
      this.updateLocalParams({ sort: undefined, order: undefined });
    }
    if (type === 'reset' || type === 'page') {
      this.updateLocalParams({ page: 1, per_page: chip.per_page });
    }
  }

  private updateLocalParams(params: SearchRepositoriesParams) {
    const current = this.localParams$.getValue();
    this.localParams$.next({ ...current, ...params });
  }
}
