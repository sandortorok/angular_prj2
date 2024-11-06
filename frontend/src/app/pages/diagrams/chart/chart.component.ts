import { Component, Input } from '@angular/core';
import Chart from 'chart.js/auto';
import { SensorHistoryService } from '../sensor-history.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import 'chartjs-adapter-date-fns';
import { scale } from '../diagrams.component';
import { SensorService } from '../../sensors/sensor.service';
import { Sensor } from '../../sensors/sensor.model';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  constructor(
    private historyService: SensorHistoryService,
    private sensorService: SensorService
  ) {
    this.historyService.getHourly.bind(this.historyService);
  }
  @Input() changedSensor!: BehaviorSubject<number>;
  @Input() changedScale!: BehaviorSubject<scale>;
  @Input() changedDate!: BehaviorSubject<string>;
  @Input() changedHour!: BehaviorSubject<number>;
  sensors: Sensor[] = [];
  selectedSensorid = 0;
  public chart: any;
  ngOnInit(): void {
    this.getSensorNames();
    combineLatest([
      this.changedSensor,
      this.changedScale,
      this.changedDate,
      this.changedHour,
    ]).subscribe((res) => {
      this.updateChart(res[0], res[1], res[2], res[3]);
    });
    this.createChart();
  }
  getSensorNames() {
    this.sensorService.sensorChange$.subscribe((res) => {
      this.sensors = res;
    });
  }
  createChart() {
    this.chart = new Chart('sensorHistoryChart', {
      type: 'line', //this denotes tha type of chart
      data: {
        // values on X-Axis
        labels: [
          '2022-05-10',
          '2022-05-11',
          '2022-05-12',
          '2022-05-13',
          '2022-05-14',
          '2022-05-15',
          '2022-05-16',
          '2022-05-17',
        ],
        datasets: [
          {
            label: 'Szenzor',
            data: ['467', '576', '572', '79', '92', '574', '573', '576'],
            backgroundColor: '#8b0000',
            borderColor: '#8b0000',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'H',
                month: 'yyyy MMMM', //YEAR+MONTH
              },
            },
          },
        },
      },
    });
  }
  getHttpFunction(scale, date) {
    switch (scale) {
      case 'hour':
        return this.historyService.getHourly(date);
      case 'day':
        return this.historyService.getDaily(date);
      case 'week':
        return this.historyService.getWeekly(date);
      case 'month':
        return this.historyService.getMonthly(date);
      default:
        return this.historyService.getYear(date);
    }
  }
  getTimeScale(scale: scale) {
    switch (scale) {
      case 'hour':
        return 'minute';
      case 'day':
        return 'hour';
      case 'week':
        return 'day';
      case 'month':
        return 'day';
      case 'year':
        return 'month';
      default:
        return 'month';
    }
  }
  updateChart(sensorId: number, scale: scale, date: string, hour: number) {
    this.getHttpFunction(scale, { date, hour }).subscribe((history) => {
      console.log(history);
      const selected = history.filter((record) => {
        return record['sensorId'] === sensorId;
      });
      const values = selected.map((data) => {
        return data['value'];
      });
      console.log(scale);
      const dates = selected.map((data) => {
        if (scale === 'year') {
          return new Date(data['year'], data['month'] - 1).getTime();
        }
        return (
          new Date(data['date']).getTime() +
          (data['hour'] || 0) * (60 * 60 * 1000) +
          (data['minute'] || 0) * (60 * 1000)
        );
      });
      console.log(dates);
      this.chart.config.options.scales.x.time.unit = this.getTimeScale(scale);
      this.chart.data.labels = dates;
      const sensor = this.sensors.find((o) => o.id === sensorId);
      if (sensor != undefined) this.chart.data.datasets[0].label = sensor?.name;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
    });
  }
  formatDate(d: Date) {
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
  }
}
