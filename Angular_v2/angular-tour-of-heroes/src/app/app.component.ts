import { Component, OnInit } from '@angular/core';
import { Hero } from './service/hero'; // TUTORIAL 4. Multiple Components : import class
import { HeroService } from './service/hero.service'; // TUTORIAL 5. Services : import class

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HeroService] // TUTORIAL 5. Service : add providers
})

export class AppComponent implements OnInit {
  title = 'Tour of Heroes';

  /**
   * TUTORIAL 2. The Hero Editor : initialize hero variable
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  */

  selectedHero: Hero; // Object {id: ..., name: ...}, you don't need to initialize

  //heroes = HEROES;
  heroes: Hero[]; // TUTORIAL 5. Service : define type because static HEROES before moves to 'mock-heroes.ts'

  constructor(private heroService: HeroService) {} // TUTORIAL 5. Service : add the constructor

  getHeroes(): void { // 5. TUTORIAL 5. Service : add function to get data HEROES
    this.heroService.getHeroes().then(heroes => this.heroes = heroes);
  }

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
}

/**
 * TUTORIAL 2. The Hero Editor : define Hero class
 * TUTORIAL 3. Master/Detail : define Hero class
 * TUTORIAL 4. Multiple Components : move to separate its own file 'hero.ts'
 */
/*export class Hero {
  id: number;
  name: string;
}*/

/**
 * TUTORIAL 5. Services : move to 'mock-heroes.ts'
 */
/*const HEROES: Hero[] = [
  { id: 11, name: 'Mr. Nice' },
  { id: 12, name: 'Narco' },
  { id: 13, name: 'Bombasto' },
  { id: 14, name: 'Celeritas' },
  { id: 15, name: 'Magneta' },
  { id: 16, name: 'RubberMan' },
  { id: 17, name: 'Dynama' },
  { id: 18, name: 'Dr IQ' },
  { id: 19, name: 'Magma' },
  { id: 20, name: 'Tornado' }
];*/
