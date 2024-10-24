import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { KwStopIconComponent } from './kw-stop-icon/kw-stop-icon.component';
import { LoginComponent } from './pages/login/login.component';
import { HelpComponent } from './pages/help/help.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AlarmComponent } from './pages/alarm/alarm.component';
import { SensorCardComponent } from './pages/sensors/sensor-card/sensor-card.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { SensorService } from './pages/sensors/sensor.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { GaugeChartComponent } from './gauge-chart/gauge-chart.component';
import { SensorDialogComponent } from './pages/sensors/gauge-dialog/gauge-dialog.component';
import { CreateSensorDialogComponent } from './pages/settings/create-sensor-dialog/create-sensor-dialog.component';
import { UpdateSensorDialogComponent } from './pages/settings/update-sensor-dialog/update-sensor-dialog.component';
import { DeleteSensorDialogComponent } from './pages/settings/delete-sensor-dialog/delete-sensor-dialog.component';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortPipe } from './pages/sensors/pipes/sort.pipe';
import { SirensComponent } from './pages/sirens/sirens.component';
import { SirenService } from './pages/sirens/siren.service';
import { CreateSirenDialogComponent } from './pages/settings/create-siren-dialog/create-siren-dialog.component';
import { UpdateSirenDialogComponent } from './pages/settings/update-siren-dialog/update-siren-dialog.component';
import { DeleteSirenDialogComponent } from './pages/settings/delete-siren-dialog/delete-siren-dialog.component';
import { AliveCanComponent } from './pages/alive-can/alive-can.component';
import { ToggleButtonComponent } from './shared/toggle-button/toggle-button.component';
import { getHunPaginatorIntl } from './hun-paginator-intl';
import { MapComponent } from './pages/map/map.component';
import { MapSvgComponent } from './pages/map/map-svg/map-svg.component';
import { UpdatePanelDialogComponent } from './pages/settings/update-panel-dialog/update-panel-dialog.component';
import { CreatePanelDialogComponent } from './pages/settings/create-panel-dialog/create-panel-dialog.component';
import { DeletePanelDialogComponent } from './pages/settings/delete-panel-dialog/delete-panel-dialog.component';
import { DiagramsComponent } from './pages/diagrams/diagrams.component';
import { ChartComponent } from './pages/diagrams/chart/chart.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

const matModules = [
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule,
  MatDividerModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatMenuModule,
  MatRadioModule,
  MatButtonToggleModule,
  MatPaginatorModule,
  MatSnackBarModule,
];

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    KwStopIconComponent,
    LoginComponent,
    HelpComponent,
    SettingsComponent,
    AlarmComponent,
    SensorCardComponent,
    SensorsComponent,
    GaugeChartComponent,
    SensorDialogComponent,
    CreateSensorDialogComponent,
    UpdateSensorDialogComponent,
    DeleteSensorDialogComponent,
    CreateSirenDialogComponent,
    UpdateSirenDialogComponent,
    DeleteSirenDialogComponent,
    OnlyNumberDirective,
    SortPipe,
    SirensComponent,
    AliveCanComponent,
    ToggleButtonComponent,
    MapComponent,
    MapSvgComponent,
    UpdatePanelDialogComponent,
    CreatePanelDialogComponent,
    DeletePanelDialogComponent,
    DiagramsComponent,
    ChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SocketIoModule.forRoot(config),
    ...matModules,
  ],
  providers: [
    SensorService,
    SirenService,
    { provide: MatPaginatorIntl, useValue: getHunPaginatorIntl() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
