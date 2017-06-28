// Observable operators
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';

// Observable class extensions
import 'rxjs/add/observable/of';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Hero } from '../service/hero';
import { HeroSearchService } from '../service/hero-search.service';

@Component({
  selector: 'hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css'],
  providers: [HeroSearchService]
})

export class HeroSearchComponent implements OnInit {
  heroes: Observable<Hero[]>;
  private searchTerms = new Subject<string>();

  constructor(
    private heroSearchService: HeroSearchService,
    private router: Router
  ) {}

  // Initialize the 'heroes' property
  ngOnInit(): void {
    this.heroes = this.searchTerms
                    .debounceTime(300)        // wait 300 ms after each keystroke before considering the term
                    .distinctUntilChanged()   // ignore if next search term is same as previous
                    .switchMap(term => term ? this.heroSearchService.search(term) : Observable.of<Hero[]>([]))
                                              // switch to new observable each time the term changes
                                              // return the http search observable
                                              // or the observable of empty heroes if there was no search term
                    .catch(error => {
                      console.log(error);
                      return Observable.of<Hero[]>([]);
                    });
  }

  // Push a search term into the observable stream.
  search(term: string) : void {
    this.searchTerms.next(term);
  }

  gotoDetail(hero: Hero): void {
    let link = ['/detail', hero.id];
    this.router.navigate(link);
  }
}
