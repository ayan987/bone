import { Injectable } from '@angular/core';
import {
  CanActivate} from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private msalService: MsalService) {}

  async canActivate(): Promise<boolean> {
    // 1. Check if we already have an active account
    let account = this.msalService.instance.getActiveAccount();

    if (account) {
      // If we do, check if the token is valid
      if (this.isTokenExpired(account)) {
        // Token is expired => log the user out and redirect them to login
        this.msalService.logoutRedirect({ postLogoutRedirectUri: '/' });
        return false;
      }
      // Token is valid => allow access
      return true;
    }

    // 2. No account yet => wait up to 10 seconds for the MSAL redirect to complete
    const tokenAvailable = await this.waitForTokenUpTo10Seconds();
    if (tokenAvailable) {
      // Once we have a token, get the new account and check validity
      account = this.msalService.instance.getActiveAccount();
      if (account && !this.isTokenExpired(account)) {
        return true; // valid token => allow route
      } else {
        // If it's expired or null, log out and force new login
        this.msalService.logoutRedirect({ postLogoutRedirectUri: '/' });
        return false;
      }
    } else {
      // 10 seconds passed and no token => force login
      this.msalService.loginRedirect({
        scopes: ['openid', 'profile', 'email']
      });
      return false;
    }
  }

  /**
   * Polls once per second for up to 10 seconds to see if MSAL has set an active account.
   */
  private waitForTokenUpTo10Seconds(): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10;
      const intervalMs = 1000;

      const intervalId = setInterval(() => {
        const account = this.msalService.instance.getActiveAccount();
        attempts++;

        if (account) {
          clearInterval(intervalId);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          resolve(false);
        }
      }, intervalMs);
    });
  }

  /**
   * Checks if the ID token is expired by comparing the `exp` claim with current time.
   */
  private isTokenExpired(account: any): boolean {
    const idTokenClaims = account.idTokenClaims as any;
    if (!idTokenClaims || !idTokenClaims.exp) {
      // If we don't have claims or exp, consider it invalid
      return true;
    }
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds >= idTokenClaims.exp;
  }
}
