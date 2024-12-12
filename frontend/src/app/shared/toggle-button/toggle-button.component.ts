import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-toggle-button',
    templateUrl: './toggle-button.component.html',
    styleUrls: ['./toggle-button.component.scss'],
    standalone: false
})
export class ToggleButtonComponent {
  @Input() isChecked = false;
  @Output() changed = new EventEmitter<boolean>();
}
