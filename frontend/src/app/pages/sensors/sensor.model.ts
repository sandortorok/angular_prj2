export interface Sensor {
  id?: number; //Dont need ID when creating sensor, but it always has an ID
  name: string;
  address: number;
  horn: boolean;
  value?: number;
}
