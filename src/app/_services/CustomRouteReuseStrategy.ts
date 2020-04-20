import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle } from '@angular/router';
import { keyframes } from '@angular/animations';
import { AuthenticationService } from './authentication.service';
import { Inject } from '@angular/core';
import { RestAPIService } from '.';

export class CustomRouteReuseStrategy extends RouteReuseStrategy {
    handlers: { [key: string]: {param: Number, handle: DetachedRouteHandle} } = {}

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        console.log('ShouldDetach has resolved to');
        if(route.data.reuseRoute) return true;
        else return false;
    }

    store(route: ActivatedRouteSnapshot, handle: import("@angular/router").DetachedRouteHandle): void {
        // if(!route.data.shouldReuse) return null;
        console.log('called store');
        console.log(route.params.id);
        this.handlers[route.data.key] = {param: route.params.id, handle: handle};
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        console.log('ShouldAttach has resolved to');
        // console.log(!!route.data.key && !!this.handlers[route.data.key].handle)
        if(route.data.key && this.handlers[route.data.key] && route.params){
            if(route.params.id == this.handlers[route.data.key].param) return true;
        }
        // return !!route.data.key && !!this.handlers[route.data.key];
        return false;
    }

    retrieve(route: ActivatedRouteSnapshot): import("@angular/router").DetachedRouteHandle {
        console.log('retrieve function called');
        console.log(this.handlers[route.data.key]);
        if (!route.data.key) {
            return null;
        }
        if(!this.handlers[route.data.key]) return null;

        return this.handlers[route.data.key].handle;
    }
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        console.log('called should reuse(), returning ' + (future.routeConfig === curr.routeConfig ? 'Returning true' : 'returing false'));
        // return future.routeConfig === curr.routeConfig;
        return false;
        
    }

    clearHandles(){
        console.log('clearing handles');
        this.handlers = {};
    }


}