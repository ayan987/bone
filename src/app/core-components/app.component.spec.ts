import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import the BrowserAnimationsModule

import { MatTabsModule } from '@angular/material/tabs'; // Import the MatTabsModule

import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { NavbarComponent } from '../components/navbar/navbar.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatTabsModule, BrowserAnimationsModule],
      declarations: [
        AppComponent, NavbarComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Bosenet One'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Bosenet One');
  });
});