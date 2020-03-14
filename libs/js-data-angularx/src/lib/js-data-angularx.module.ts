import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataStore } from '@js-data/js-data';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    {provide: DataStore},
  ],
  // exports: [DataStore]
})
export class JsDataAngularxModule {}
