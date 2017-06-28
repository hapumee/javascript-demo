import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Hero } from './hero';

@Injectable()
export class HeroService {
  getHero(id: number): Promise<Hero> {
    return this.getHeroes()
      .then(heroes => heroes.find(hero => hero.id === id));
  }

  // TUTORIAL 7. HTTP : using in-memory web api
  private heroesUrl = 'api/heroes'; // URL to web api

  constructor(private http: Http) { }

  getHeroes(): Promise<Hero[]> {
    return this.http
          .get(this.heroesUrl)
          .toPromise()
          .then(response => response.json().data as Hero[])
          .catch(this.handleError);
  }

  private headers = new Headers({'Content-Type': 'application/json'});

  update(hero: Hero): Promise<Hero> {
    const url = `${this.heroesUrl}/${hero.id}`; // NOTICE : USE BACKQUOTE!

    return this.http
          .put(url, JSON.stringify(hero), {headers: this.headers})
          .toPromise()
          .then(() => hero)
          .catch(this.handleError);
  }

  create(name: string): Promise<Hero> {
    return this.http
          .post(this.heroesUrl, JSON.stringify({name: name}), {headers: this.headers})
          .toPromise()
          .then(response => response.json().data as Hero)
          .catch(this.handleError);
  }

  delete(id: number): Promise<void> {
    const url = `${this.heroesUrl}/${id}`; // NOTICE : USE BACKQUOTE!

    return this.http
          .delete(url, {headers: this.headers})
          .toPromise()
          .then(() => null)
          .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
