import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss'],
})
export class GaugeChartComponent implements OnInit {
  public chart;
  @Input() value: number = 0;
  ngOnInit(): void {
    this.createChart();
  }
  createChart() {
    const gaugeNeedle = {
      id: 'gaugeNeedle',
      afterDatasetDraw(chart, args, options) {
        const {
          ctx,
          config,
          data,
          chartArea: { top, bottom, left, right, width, height },
        } = chart;

        ctx.save();
        const dataTotal = data.datasets[0].data.reduce((a, b) => a + b, 0);
        const needleValue = data.datasets[0].needleValue;
        // prettier-ignore
        const angle = Math.PI + (1 / dataTotal * needleValue * Math.PI);
        const cx = width / 2;
        const cy = chart.getDatasetMeta(0).data[0].y;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(ctx.canvas.offsetHeight - 200, 0);
        ctx.lineTo(0, 2);
        ctx.fillStyle = '#444';
        ctx.fill();

        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 10);
        ctx.fill();

        ctx.restore();
        ctx.font = '50px sans-serif';
        ctx.fillStyle = '#444';
        ctx.fillText(needleValue + ' ppm', cx - 100, cy + 60);
        // ctx.textAlign = 'center';
      },
    };
    const config: any = {
      type: 'doughnut', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['OK', 'Elégséges', 'Baj van!'],
        datasets: [
          {
            label: 'Határérték',
            data: [30, 40, 30],
            backgroundColor: [
              'rgba(0,255,0,0.3)',
              'rgba(255,255,0,0.3)',
              'rgba(255,50,100,0.3)',
            ],
            borderColor: [
              'rgba(0,255,0,1)',
              'rgba(255,255,0,1)',
              'rgba(255,50,100,1)',
            ],
            needleValue: this.value,
            borderWidth: 2,
            cutout: '95%',
            circumference: 180,
            rotation: 270,
            borderRadius: 5,
          },
        ],
      },
      options: {
        aspectRation: 1.5,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            enabled: true,
          },
        },
      },
      plugins: [gaugeNeedle],
    };
    this.chart = new Chart('myChart', config);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!this.chart) return;
    if (changes['value'].currentValue > 100)
      changes['value'].currentValue = 100;

    this.chart.config.data.datasets[0].needleValue =
      changes['value'].currentValue;
    this.chart.update();
  }
}
