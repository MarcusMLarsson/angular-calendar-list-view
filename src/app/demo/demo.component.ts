import { Component, inject, DestroyRef } from '@angular/core';
import { ListView } from '../utils/utils';
import { StateService } from '../service/state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { events } from '../utils/utils';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent {
  viewDate: Date = new Date();
  listView = ListView.Day;

  /**
   * The selected date in the day picker
   */
  dayPickerSelectedDate!: Date;

  private destroyRef = inject(DestroyRef);

  events = events;

  constructor(private calendarListStateService: StateService) {
    // listens to when the user scrolls in the list
    this.calendarListStateService.listViewScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.dayPickerSelectedDate = date;
      });
  }

  /**
   * This method is called when the user scrolls in the list view.
   * Updates the dayPickerSelectedDate in the list view based on the scroll position
   */
  onScroll(): void {
    const scrollableContainer = document.querySelector('.scroll-container');
    // Get the position the the scrollable container element relative to the viewport
    const containerPosition = scrollableContainer?.getBoundingClientRect();

    if (!scrollableContainer) return;

    const dateHeaderElements =
      scrollableContainer.querySelectorAll('.date-header');

    for (let i = 0; i < dateHeaderElements.length; i++) {
      const dateHeader = dateHeaderElements[i] as HTMLElement;

      // Get the position the current date header element relative to the viewport
      const headerPosition = dateHeader.getBoundingClientRect();

      // Check if the bottom of the current header is greater than or equal to the top of the scrollable container
      // This means the header is still within view and hasn't been scrolled past the top of the container
      if (
        containerPosition &&
        dateHeader.textContent &&
        headerPosition.bottom >= containerPosition.top
      ) {
        const dateLabel = dateHeader.textContent.trim();

        const parsedDate = this.parseDateFromLabel(dateLabel);

        // Updates the dayPickerSelectedDate in the list view based on the scroll position
        if (parsedDate) {
          this.calendarListStateService.setListViewScrolledDate(parsedDate);
        }

        break;
      }
    }
  }

  private parseDateFromLabel(dateLabel: string): Date | null {
    // Extract day and month from dateLabel
    const parsedDate = new Date(
      `${dateLabel} ${this.dayPickerSelectedDate.getFullYear()}`
    );

    // Check if the parsed date is valid
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    return null;
  }

  ngOnInit() {
    // Hide parent scrollbar
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restore parent scrollbar
    document.body.style.overflow = '';
  }
}
