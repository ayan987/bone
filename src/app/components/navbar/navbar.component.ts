import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NavigationEnd, Router, UrlTree } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../modules/shared/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  selectedTabIndex = 0;

  userName: string | null = null;
  userEmail: string | null = null;
  // profilePicUrl: string | undefined = '';
  private userNameSub: Subscription | undefined;
  private accessTokenSub: Subscription | undefined;
  profilePicUrl$ = this.authService.profilePicUrl$;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to userName$ so we get live updates
    this.userNameSub = this.authService.userName$.subscribe(
      (userData: any) => {
        this.userName = userData?.name;
        this.userEmail = userData?.email;
      }
    );
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const urlTree: UrlTree = this.router.parseUrl(this.router.url);
      const fullPath = this.router.serializeUrl(urlTree);
      this.updateTabIndex(fullPath);
    });
    this.accessTokenSub = this.authService.accessToken$.subscribe(accessToken => {
      if (accessToken && this.userEmail) {
        this.authService.getProfilePicture(this.userEmail);
        // this.fetchProfilPicture(this.userEmail);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    this.userNameSub?.unsubscribe();
    this.accessTokenSub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  fetchProfilPicture(email: string): void {
    // this.authService.getProfilePicture(email).subscribe({
    //   next: (data: any) => {
    //     const blobUrl = URL.createObjectURL(data);
    //     this.profilePicUrl = blobUrl;
    //   },
    //   error: (err: any) => {
    //     console.log(err);
    //   }
    // });
  }

  updateTabIndex(route: string | undefined) {
    switch(route) {
      case '/project-overview': this.selectedTabIndex = 0; break;
      case '/clients': this.selectedTabIndex = 1; break;
      case '/consultants': this.selectedTabIndex = 2; break;
      case '/template-overview': this.selectedTabIndex = 3; break;
      case '/timesheets': this.selectedTabIndex = 4; break;
      case '/holidays': this.selectedTabIndex = 5; break;
      default: this.selectedTabIndex = 0;
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.switchTabs(event.index);
  }

  switchTabs(index: number) {
    switch (index) {
      case 0: // Projects tab
        this.router.navigate(['/project-overview']);
        break;
      case 1: // Clients tab
        this.router.navigate(['/clients']);
        break;
      case 2: // Consultants tab
        this.router.navigate(['/consultants']);
        break;
      case 3:
        this.router.navigate(['/template-overview']);
        break;
      case 4:
        this.router.navigate(['/timesheets']);
        break;
      case 5:
        this.router.navigate(['/holidays']);
        break;
      default:
        break;
    }
  }

}
