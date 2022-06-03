import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { RepositoriesService } from '../repositories.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseComponent {
  @Output() public readonly search = new EventEmitter<string>();

  public readonly loading$ = this.repositories.loading$;
  public readonly items$ = this.repositories.items$;
  public readonly error$ = this.repositories.error$;
  public readonly empty$ = this.repositories.empty$;

  constructor(protected repositories: RepositoriesService) {}
}
