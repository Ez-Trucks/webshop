import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localNlBe from '@angular/common/locales/nl-BE'
registerLocaleData(localNlBe)
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

