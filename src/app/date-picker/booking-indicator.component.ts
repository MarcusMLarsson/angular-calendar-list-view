import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-booking-indicators',
  template: `
    <div class="booking-indicators">
      <ng-container *ngFor="let _ of indicators.dots">
        <div class="booking-indicator"></div>
      </ng-container>
      <div class="plus-indicator" *ngIf="indicators.showPlus"></div>
    </div>
  `,
  styles: [
    `
      .booking-indicators {
        display: flex;
        align-items: center;
        gap: 2px;
        justify-content: center;
        position: absolute;
        bottom: -8px;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: 10px;
      }

      .booking-indicator {
        width: 5px;
        height: 5px;
        background-color: #ffb347;
        border-radius: 50%;
        pointer-events: none;
        flex-shrink: 0;
      }

      .plus-indicator {
        position: relative;
        width: 5px;
        height: 5px;
        flex-shrink: 0;
      }

      .plus-indicator::before,
      .plus-indicator::after {
        content: '';
        position: absolute;
        background-color: black;
      }

      .plus-indicator::before {
        width: 1px;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
      }

      .plus-indicator::after {
        height: 1px;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    `,
  ],
})
export class BookingIndicatorsComponent {
  @Input() bookingCount!: number;

  get indicators() {
    return {
      dots: Array(Math.min(this.bookingCount, 2)).fill(0),
      showPlus: this.bookingCount > 2,
    };
  }
}
