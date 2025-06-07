import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './core-components/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './routing/app-routing.module';
import { SharedModule } from './modules/shared/shared.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from './environments/environment';
import { MSAL_INSTANCE, MsalService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
import { SessionExpiredDialogComponent } from './components/session-expired-dialog/session-expired-dialog.component';


export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msClientId, // Replace with your Application ID
      authority: 'https://login.microsoftonline.com/f129bd96-bdd0-437a-a6c0-bcce2c450aae', // Replace with your Tenant ID
      redirectUri: environment.redirectUri
    },
    cache: {
      // cacheLocation: 'localStorage',
      storeAuthStateInCookie: isIE() // Set to true for IE11 or Edge
    }
  });
}

function isIE(): boolean {
  const ua = window.navigator.userAgent;
  return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
}

// Function to initialize MSAL instance
export function initializeMsal(msalService: MsalService): () => Promise<void> {
  return async () => {
    await msalService.instance.initialize();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SessionExpiredDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    SharedModule.forRoot(),
  ],
  providers: [
    provideAnimationsAsync(),
    MsalService,
            {
              provide: MSAL_INSTANCE,
              useFactory: MSALInstanceFactory
            },
            {
              provide: APP_INITIALIZER,
              useFactory: initializeMsal,
              deps: [MsalService],
              multi: true
            },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
