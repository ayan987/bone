import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';
import { SessionMonitorService } from '../session-monitor/session-monitor.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface UserData {
  name: string | null;
  email: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject to broadcast the currently logged-in user's name (or null if not logged in)
  private userNameSubject = new BehaviorSubject<UserData | null>(null);
  private _accessToken$ = new BehaviorSubject<string>('');
  private _profilePicUrl$ = new BehaviorSubject<string | null>(
    localStorage.getItem('profilePicUrl')
  );
  public profilePicUrl$ = this._profilePicUrl$.asObservable();

  // Expose it as an observable to subscribe in other components
  userName$ = this.userNameSubject.asObservable();
  accessToken$ = this._accessToken$.asObservable();
  graphApi = environment.msGraphApiUrl;

  constructor(private msalService: MsalService, private sessionMonitorService: SessionMonitorService, private readonly http: HttpClient) {

  }

  /**
   * Handles the MSAL login redirect promise once, sets active account and updates userNameSubject
   */
  async handleRedirect(): Promise<void> {
    try {
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result && result.account) {
        // Set the active account
        this.msalService.instance.setActiveAccount(result.account);

        // Extract the user’s display name or username from the account
        const currentName = result.account?.name || result.account?.username;
        const currentEmail = result.account?.username || null;
        this.userNameSubject.next({ name: currentName || null, email: currentEmail });
        localStorage.setItem('token', JSON.stringify(result.idToken));
        localStorage.setItem('accessToken', JSON.stringify(result.accessToken));
        localStorage.setItem('loggedInUser', JSON.stringify(currentEmail));
        const storedAccessToken = localStorage.getItem('accessToken') ?? '';
        this._accessToken$.next(storedAccessToken);
        // Start the session monitor once we know the active account
        this.sessionMonitorService.startMonitoring();

        // If you need the token:
        // localStorage.setItem('token', JSON.stringify(result.idToken));
      }

      // If no active account, optionally auto-login or do nothing
      if (!this.isLoggedIn()) {
        this.login();
      }

    } catch (error) {
      console.error('MSAL redirect error:', error);
    }
  }

  login(): void {
    this.msalService.loginRedirect({
      scopes: ['openid', 'profile', 'email']
    });
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/'
    });
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }

  /**
   * Optional: If you want to refresh userName in case it changed or
   * after the user was already logged in (i.e., skipping the redirect flow).
   */
  updateUserName(): void {
    const account = this.msalService.instance.getActiveAccount();
    const currentName = account?.name || account?.username;
    const currentEmail = account?.username || null;
    this.userNameSubject.next({ name: currentName ?? null, email: currentEmail });
  }

  updateAccessToken(): void {
    const storedAccessToken = localStorage.getItem('accessToken') ?? '';
    this._accessToken$.next(storedAccessToken);
  }

  getProfilePicture(email: string): Observable<string> {
    const url$ = this.http
      .get(`${this.graphApi}users/${email}/photo/$value`, {
        responseType: 'blob'
      })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        tap(blobUrl => {
          localStorage.setItem('profilePicUrl', blobUrl);
          this._profilePicUrl$.next(blobUrl);
        }),
        shareReplay(1)
      );

    // trigger the HTTP call and subject update
    url$.subscribe({ error: console.error });
    return url$;
  }

  getAllProfilePicture(email: string | null): Observable<any> {
    return this.http.get<any>(`${this.graphApi}users/${email}/photo/$value`, { responseType: 'blob' as 'json' });
  }

}
