import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export type Owner = {
  id: number;
  node_id: string;

  type: string;
  login: string;
  avatar_url: string;
  gravatar_id: string;

  url: string;
  html_url: string;
  received_events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  site_admin: boolean;
};

export type License = {
  key: string;
  name: string;
  url: string;
  spdx_id: string;
  node_id: string;
  html_url: string;
};

export type Repository = {
  id: number;
  node_id: string;

  name: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string;

  full_name: string;
  description: string;
  homepage: string;
  topics?: string[];

  owner: Owner;
  license: License;

  private: boolean;
  visibility: boolean;
  fork: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_pages: boolean;
  has_wiki: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;

  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  score: number;
  forks: number;
  open_issues: number;
  watchers: number;

  master_branch: string;
  default_branch: string;

  url: string;
  html_url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url: string;
  hooks_url: string;
  svn_url: string;
};

export type SearchResponse<T> = {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
};

export type SearchRepositoriesParams = {
  q?: string;
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
  order?: 'desc' | 'asc';
  page?: number;
  per_page?: number;
};

@Injectable({ providedIn: 'root' })
export class GithubService {
  constructor(protected http: HttpClient) {}

  searchRepositories(params: SearchRepositoriesParams) {
    return this.http.get<SearchResponse<Repository>>(
      'https://api.github.com/search/repositories',
      { params: new HttpParams({ fromObject: params }) }
    );
  }
}
