import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [MatTabsModule, BrowserAnimationsModule],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of(new NavigationEnd(0, '/project-overview', '/project-overview')),
            url: '/project-overview',
            parseUrl: (url: string) => ({ root: {}, queryParams: {}, fragment: '', queryParamsHandling: null }),
            serializeUrl: (tree: any) => tree,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to project overview when Projects tab is clicked', () => {
    const tabChangeEvent: MatTabChangeEvent = { index: 0 } as MatTabChangeEvent;

    component.onTabChange(tabChangeEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/project-overview']);
  });

  it('should navigate to clients when Clients tab is clicked', () => {
    const tabChangeEvent: MatTabChangeEvent = { index: 1 } as MatTabChangeEvent;

    component.onTabChange(tabChangeEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
  });

  it('should navigate to consultants when Consultant tab is clicked', () => {
    const tabChangeEvent: MatTabChangeEvent = { index: 2 } as MatTabChangeEvent;

    component.onTabChange(tabChangeEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/consultants']);
  });

  // it('should update selectedTabIndex based on URL when NavigationEnd event is emitted', () => {
  //   spyOn(component, 'updateTabIndex').and.callThrough();
  //   (router.events as any) = of(new NavigationEnd(0, '/clients', '/clients'));
  //   fixture.detectChanges();

  //   expect(component.updateTabIndex).toHaveBeenCalledWith('/clients');
  //   expect(component.selectedTabIndex).toBe(1);
  // });

  it('should set selectedTabIndex to 0 for unknown routes', () => {
    component.updateTabIndex('/unknown-route');
    expect(component.selectedTabIndex).toBe(0);
  });

  // it('should set selectedTabIndex correctly on init based on the current URL', () => {
  //   spyOn(component, 'updateTabIndex').and.callThrough();

  //   component.ngOnInit();

  //   expect(component.updateTabIndex).toHaveBeenCalledWith('/project-overview');
  //   expect(component.selectedTabIndex).toBe(0);
  // });

  it('should navigate to the correct route when switchTabs is called', () => {
    component.switchTabs(0);
    expect(router.navigate).toHaveBeenCalledWith(['/project-overview']);

    component.switchTabs(1);
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);

    component.switchTabs(2);
    expect(router.navigate).toHaveBeenCalledWith(['/consultants']);
  });

  // Additional test cases
  it('should not navigate for invalid tab index in switchTabs', () => {
    component.switchTabs(3);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
