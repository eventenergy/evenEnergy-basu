import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule, HomeRoutingComponent } from './home-routing.module';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MainNavbarModule } from '../navbar/main-navbar/main-navbar.module';
import { ClickOutsideModule } from '../_directives';
import { TimeAgoModule } from '../_helpers/index';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { SearchModule } from '../search/search.module';
import { StaticPageComponent } from './static-page/static-page.component'
import { FooterModule } from '../footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    MainNavbarModule,
    ClickOutsideModule,
    HomeRoutingModule,
    FormsModule,
    CarouselModule.forRoot(),
    TimeAgoModule,
    SlickCarouselModule,
    SearchModule,
    FooterModule
  ],
  declarations: [HomeRoutingComponent, StaticPageComponent,]
})
export class HomeModule { }
