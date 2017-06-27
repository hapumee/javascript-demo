import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';

@Injectable()
export class HeroService {
  getHeroes(): Promise<Hero[]> { // TUTORIAL 5. add Promise function to get data HEROES
    return Promise.resolve(HEROES);
  }
}
