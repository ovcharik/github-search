import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';

import { Repository } from '../github.service';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositoryComponent {
  @Input() repository!: Repository;
  @Output() public readonly search = new EventEmitter<string>();
}
