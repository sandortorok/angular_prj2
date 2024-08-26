import { Sensor } from '../sensors/sensor.model';
import { Siren } from '../sirens/siren.model';

export interface Panel {
  id: number; //Dont need ID when creating sensor, but it always has an ID
  path: string;
  address: string;
  sensors?: Sensor[];
  sirens?: Siren[];
}
