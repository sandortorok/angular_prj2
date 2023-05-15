import { MatPaginatorIntl } from '@angular/material/paginator';

const hunRangeLabel = (page: number, pageSize: number, length: number) => {
  var firstDigit = ('' + length)[0];
  let nevelo: 'a' | 'az' = 'a';
  let toldalek: 'ból' | 'ből' = 'ból';
  switch (firstDigit) {
    case '0':
    case '2':
    case '3':
    case '4':
    case '6':
    case '7':
    case '8':
    case '9':
      nevelo = 'a';
      break;
    case '1':
      const szamhossz = ('' + length).length;
      if (szamhossz % 3 === 0 || szamhossz % 3 === 1) {
        nevelo = 'az';
      } else {
        nevelo = 'a';
      }
      break;
    case '5':
      nevelo = 'az';
      break;
  }
  if (length == 0 || pageSize == 0) {
    return `0 of ${length}`;
  }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex =
    startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} of ${length}`;
};

export function getHunPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Egy oldalon lévő elemek:';
  paginatorIntl.nextPageLabel = 'Következő oldal';
  paginatorIntl.previousPageLabel = 'Előző oldal';
  paginatorIntl.getRangeLabel = hunRangeLabel;

  return paginatorIntl;
}
