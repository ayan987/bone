import { Component, OnInit } from '@angular/core';
import { AuthService } from '../modules/shared/services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Bosenet One';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Handle MSAL redirect once, set active account, and broadcast userName
    this.authService.handleRedirect();
    this.authService.updateUserName();
    this.authService.updateAccessToken()
  }

}
