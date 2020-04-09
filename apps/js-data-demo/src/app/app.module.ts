import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { JsDataAngularxModule } from '@js-data/js-data-angularx';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, JsDataAngularxModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
