export interface Sensor {
  id?: number; //Dont need ID when creating sensor, but it always has an ID
  raw?: number;
  name: string;
  address: number;
  horn: boolean;
  value?: number;
}
