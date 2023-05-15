import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Sensor } from '../sensor.model';

export type SortOrder = 'asc' | 'desc';

@Injectable()
@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(
    value: Sensor[],
    sortOrder: SortOrder | string = 'asc',
    sortKey?: string
  ): any {
    sortOrder = sortOrder && (sortOrder.toLowerCase() as any);

    if (!value || (sortOrder !== 'asc' && sortOrder !== 'desc')) return value;

    let numberArray: any[] = [];
    let stringArray: any[] = [];

    if (!sortKey) {
      numberArray = value.filter((item) => typeof item === 'number').sort();
      stringArray = value.filter((item) => typeof item === 'string').sort();
    } else {
      if (value.length === 0 || !value[0][sortKey]) return value;
      numberArray = value
        .filter((item) => typeof item[sortKey] === 'number')
        .sort((a, b) => a[sortKey] - b[sortKey]);
      stringArray = value
        .filter((item) => typeof item[sortKey] === 'string')
        .sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return -1;
          else if (a[sortKey] > b[sortKey]) return 1;
          else return 0;
        });
    }
    const sorted = numberArray.concat(stringArray);
    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }
}
