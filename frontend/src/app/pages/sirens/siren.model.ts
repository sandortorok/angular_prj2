export interface Siren {
  id?: number; //Dont need ID when creating sensor, but it always has an ID
  name: string;
  address: string;
  muted: boolean;
  isOn?: boolean;
  panelId: number;
}
