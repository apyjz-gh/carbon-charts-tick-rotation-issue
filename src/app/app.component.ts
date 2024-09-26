import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  formatISO,
  parseISO
} from 'date-fns';
import { BarChartOptions, ChartsModule, ScaleTypes, TickRotations } from '@carbon/charts-angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { delay, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartsModule, AsyncPipe, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'carbon-charts-tick-rotation-issue';

  data = timeSeriesDateData();

  visible = of(true).pipe(delay(1));

  tickRotation: TickRotations = TickRotations.AUTO;

  useCustomTimeIntervalFormats: boolean = true;

  options: BarChartOptions = this.calculateOptions();

  onInputFormChange(): void {
    this.options = this.calculateOptions();
    this.visible = of(false, true).pipe(delay(1));
  }

  private calculateOptions(): BarChartOptions {
    return {
      "animations": false,
      "color": {
        "pairing": {
          "option": 1
        }
      },
      "legend": {
        "enabled": false,
        "position": "right",
        "alignment": "left"
      },
      "resizable": true,
      "toolbar": {
        "enabled": false
      },
      "axes": {
        "left": {
          "mapsTo": "value",
          "visible": true,
          "includeZero": true
        },
        "bottom": {
          "mapsTo": "date",
          "scaleType": ScaleTypes.TIME,
          "ticks": {
            "rotation": this.tickRotation
          },
          "visible": true
        }
      },
      "grid": {
        "x": {
          "enabled": false
        },
        "y": {
          "enabled": true
        }
      },
      "timeScale": {
        timeIntervalFormats: this.useCustomTimeIntervalFormats ? {
          '15seconds': {
            primary: 'PP pp',
            secondary: 'HH:mm:ss',
          },
          minute: {
            primary: 'PP p',
            secondary: 'HH:mm',
          },
          '30minutes': {
            primary: 'PP p',
            secondary: 'HH:mm',
          },
          hourly: {
            primary: 'PP HH:mm',
            secondary: 'HH:mm',
          },
          daily: {
            primary: 'PP',
            secondary: `dd MMM`,
          },
          weekly: {
            primary: 'PP',
            secondary: `dd MMM`,
          },
          monthly: {
            primary: 'MMM y',
            secondary: 'LLL',
          },
          quarterly: {
            primary: 'QQQ y',
            secondary: 'qqq',
          },
          yearly: {
            primary: 'y',
            secondary: 'y',
          },
        } : {}
      }
    }
  }
}

export interface TimeSeriesDatum {
  /**
   * Determines the date of the group.
   */
  date: Date | number | string;
  /**
   * The name of the group.
   */
  group: string;
  /**
   * The absolute numerical value.
   */
  value: number;
}

export const timeSeriesDateData = (): TimeSeriesDatum[][] => {
  type AddFn = typeof addSeconds;

  interface AddFnOperand {
    value: number;
    description: string;
  }

  const baseData: number[] = [127, 126, 102, 131, 157, 106, 154, 104, 124, 124];

  /**
   *  We use `bind` to create new instances of the respective functions to convert them to identity keys.
   */
  const intervals = new Map<AddFn, AddFnOperand>([
    [addSeconds.bind(null), {value: 15, description: '15 seconds'}],
    [addMinutes.bind(null), {value: 1, description: '1 minute'}],
    [addMinutes.bind(null), {value: 5, description: '5 minutes'}],
    [addHours.bind(null), {value: 1, description: '1 hour'}],
    [addDays.bind(null), {value: 1, description: '1 day'}],
    [addDays.bind(null), {value: 2, description: '2 days'}],
    [addWeeks.bind(null), {value: 1, description: '1 week'}],
    [addMonths.bind(null), {value: 2, description: '2 month'}],
    [addYears.bind(null), {value: 1, description: '1 year'}],
  ]);

  const timeSeriesData = (intervals: ReadonlyMap<AddFn, AddFnOperand>, values: number[], start: Date | number): TimeSeriesDatum[][] => {
    const nextDate = (add: AddFn) => (amount: number) => formatISO(add(start, amount));
    return Array.from(intervals, ([add, amount]) =>
      values.map((value, index) => ({
        value,
        date: nextDate(add)(amount.value * index),
        group: amount.description,
      }))
    );
  };

  return timeSeriesData(intervals, baseData, parseISO('2021-12-15T12:00:00+01:00'));
};
