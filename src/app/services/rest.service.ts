import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class RestService {
  constructor (private http: HttpClient) {}

  public get (url: string) {
    return this.http.get(url)
  }

  public postca (url: string, info: object){
    return this.http.post<any>(url, info);
  }

  public postloggin (url: string, info: object){
    return this.http.post<any>(url, info);
  }

  public getuser (url: string){
    return this.http.get<any>(url);
  }

  public putuser (url: string, info: object){
    return this.http.post<any>(url, info);
  }

  public getbooksuser (url: string){
    return this.http.get<any>(url);
  }

  public postbooksuser (url: string, info: object){
    return this.http.post<any>(url, info);
  }
}
