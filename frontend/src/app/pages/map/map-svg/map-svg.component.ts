import { Component, Input, SimpleChanges } from '@angular/core';
import { Sensor, redMin, yellowMin } from '../../sensors/sensor.model';

@Component({
  selector: 'app-map-svg',
  templateUrl: './map-svg.component.html',
  styleUrls: ['./map-svg.component.scss'],
})
export class MapSvgComponent {
  @Input() sensors: Sensor[] = [];
  colors = {};
  ngOnChanges(changes: SimpleChanges) {
    let cur = changes['sensors'].currentValue;
    cur.forEach((sensor: Sensor) => {
      let color = 'gray';
      if (sensor.value && sensor.value < yellowMin) {
        color = 'green';
      } else if (
        sensor.value &&
        sensor.value > yellowMin &&
        sensor.value < redMin
      ) {
        color = 'yellow';
      } else if (sensor.value && sensor.value > redMin) {
        color = 'red';
      }
      this.colors['S' + sensor.address] = color;
    });
    console.log(this.colors);
  }
}
