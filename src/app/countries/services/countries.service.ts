import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from '../interfaces/country';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private apiUrl: string = 'https://restcountries.com/v3.1';

  public cacheStore: CacheStore = {
    byCapital: {term:'', countries:[]},
    byCountries: {term:'', countries:[]},
    byRegion: {region:'', countries:[]}
  }

  constructor(private http: HttpClient) {
    this.LoadToLocalStorage();
   }

  private saveToLocalStorage(){
    localStorage.setItem('cacheStore', JSON.stringify(this.cacheStore));
  }

  private LoadToLocalStorage(){
    if(!localStorage.getItem('cacheStore')) return;

    this.cacheStore = JSON.parse( localStorage.getItem('cacheStore')! );
  }

  private getCountriesRequest( url: string): Observable<Country[]>{
    return this.http.get<Country[]>( url )
      .pipe(
        catchError( () => of( [] ) ),
        // delay( 2000 )
    );
  }

  public searchCountryByAplphaCode(code:string): Observable<Country | null>{
    const url: string = `${this.apiUrl}/alpha/${code}`;
    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.length > 0 ? countries[0]: null),
        catchError( () => of(null) )
      );
  }

  public searchCapital(term: string): Observable<Country[]>{
    const url: string = `${this.apiUrl}/capital/${term}`;
    return this.getCountriesRequest( url )
    .pipe(
      tap( countries => {
        this.cacheStore.byCapital = { term, countries }
      }),
      tap( () => this.saveToLocalStorage())
    );
  }

  public searchCountry(term: string): Observable<Country[]>{
    const url: string = `${this.apiUrl}/name/${term}`;
    return this.getCountriesRequest( url )    .pipe(
      tap( countries => {
        this.cacheStore.byCountries = { term, countries }
      }),
      tap( () => this.saveToLocalStorage())
    );
  }

  public searchRegion(region: Region): Observable<Country[]>{
    const url: string = `${this.apiUrl}/region/${region}`;
    return this.getCountriesRequest( url )
    .pipe(
      tap( countries => {
        this.cacheStore.byRegion = { region, countries }
      }),
      tap( () => this.saveToLocalStorage())
    );
  }

}
