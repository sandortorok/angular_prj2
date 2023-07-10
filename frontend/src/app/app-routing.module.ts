import { SensorsComponent } from './pages/sensors/sensors.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AlarmComponent } from './pages/alarm/alarm.component';
import { SensorCardComponent } from './pages/sensors/sensor-card/sensor-card.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HelpComponent } from './pages/help/help.component';
import { SirensComponent } from './pages/sirens/sirens.component';
import { AliveCanComponent } from './pages/alive-can/alive-can.component';
import { AuthGuard } from './pages/login/guards/auth.guard';
import { AdminGuard } from './pages/login/guards/admin.guard';
import { MapComponent } from './pages/map/map.component';

const routes: Routes = [
  { path: 'sensors', component: SensorsComponent, canActivate: [AuthGuard] },
  { path: 'alarm', component: AlarmComponent, canActivate: [AuthGuard] },
  { path: 'sirens', component: SirensComponent, canActivate: [AuthGuard] },
  { path: 'cans', component: AliveCanComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AdminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'help', component: HelpComponent, canActivate: [AuthGuard] },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
