import { Component } from '@angular/core';
import { ListView, CalendarEvent, colors } from '../utils/utils';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent {
  viewDate: Date = new Date();
  listView = ListView.Day;

  events: CalendarEvent[] = [
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 6)),
      end: new Date(new Date().setDate(new Date().getDate() - 6)),
    },
    /*{
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 5)),
      end: new Date(new Date().setDate(new Date().getDate() - 5)),
    }, */
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 4)),
      end: new Date(new Date().setDate(new Date().getDate() - 4)),
    },
    /*{
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 3)),
      end: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      title: 'An  event',
      color: colors.red,
      start: new Date(new Date().setDate(new Date().getDate() - 3)),
      end: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      title: 'An  event',
      color: colors.red,
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
    }, */
    {
      title: 'An  event',
      color: colors.blue,
      start: new Date(new Date().setDate(new Date().getDate() - 1)),
      end: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      title: 'An  event',
      color: colors.red,
      start: new Date(new Date().setDate(new Date().getDate() - 1)),
      end: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      title: 'An  event',
      color: colors.blue,
      start: new Date(new Date().setDate(new Date().getDate() - 1)),
      end: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(),
      end: new Date(),
      allDay: true,
    },
    {
      title: 'A non all day event',
      color: colors.blue,
      start: new Date(),
      end: new Date(),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    {
      title: 'An  event',
      color: colors.yellow,
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
  ];

  ngOnInit() {
    // Hide parent scrollbar
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restore parent scrollbar
    document.body.style.overflow = '';
  }
}
