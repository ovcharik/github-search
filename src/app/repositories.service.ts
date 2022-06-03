import { BehaviorSubject, distinctUntilChanged, EMPTY, startWith } from 'rxjs';
import { finalize, shareReplay, pluck, map, tap } from 'rxjs';
import { switchMap, of, delay, catchError } from 'rxjs';

import { Injectable } from '@angular/core';

import { GithubService, SearchRepositoriesParams } from './github.service';

const isString = (data: unknown): data is string => {
  return typeof data === 'string';
};

const isInteger = (data: unknown): data is number => {
  return Number.isInteger(data);
};

export type SearchRepositoryChip =
  | { label: string; type: 'search' }
  | { label: string; type: 'sort' }
  | { label: string; type: 'page' | 'reset'; per_page: number };

@Injectable({ providedIn: 'root' })
export class RepositoriesService {
  protected loadingSubject$ = new BehaviorSubject<boolean>(false);
  protected paramsSubject$ = new BehaviorSubject<SearchRepositoriesParams>({});
  protected errorSubject$ = new BehaviorSubject<Error | undefined>(undefined);

  public readonly response$ = this.paramsSubject$.pipe(
    switchMap((params) => {
      const emptyResponse = of({
        total_count: 0,
        incomplete_results: false,
        items: [],
      });

      if (!params || !isString(params.q) || params.q.length <= 2) {
        return emptyResponse;
      }

      return of(1).pipe(
        tap(() => {
          this.loadingSubject$.next(true);
          this.errorSubject$.next(undefined);
        }),
        delay(400),
        switchMap(() => this.github.searchRepositories(params)),
        catchError((error) => {
          this.errorSubject$.next(error);
          return emptyResponse;
        }),
        finalize(() => this.loadingSubject$.next(false))
      );
    }),
    shareReplay(1)
  );

  public readonly chips$ = this.paramsSubject$.pipe(
    map(({ q, sort, order, page, per_page }) => {
      const chips: SearchRepositoryChip[] = [];
      if (q) {
        chips.push({ type: 'search', label: `Search: ${q}` });
      }
      if (sort && order) {
        const arrow = order === 'asc' ? '↑' : '↓';
        chips.push({ type: 'sort', label: `Sort: ${sort} ${arrow}` });
      }
      if (isInteger(page) && 1 < page && isInteger(per_page)) {
        const from = (page - 1) * per_page + 1;
        const to = page * per_page;
        chips.push({ type: 'page', label: `Page: ${from} - ${to}`, per_page });
      }
      if (chips.length) {
        chips.unshift({ type: 'reset', label: 'Reset', per_page: 5 });
      }
      return chips;
    })
  );

  public readonly loading$ = this.loadingSubject$.pipe(distinctUntilChanged());
  public readonly params$ = this.paramsSubject$.asObservable();
  public readonly error$ = this.errorSubject$.pipe(distinctUntilChanged());
  public readonly items$ = this.response$.pipe(pluck('items'));
  public readonly count$ = this.response$.pipe(pluck('total_count'));
  public readonly empty$ = this.count$.pipe(
    map((x) => !x),
    distinctUntilChanged(),
    startWith(true)
  );

  constructor(protected github: GithubService) {}

  public search(params: SearchRepositoriesParams) {
    this.paramsSubject$.next(params);
  }
}
