export interface Sensor {
  id?: number; //Dont need ID when creating sensor, but it always has an ID
  raw?: number;
  name: string;
  address: number;
  horn: boolean;
  value?: number;
}

export const redMin: number = 70;
export const yellowMin: number = 30;
