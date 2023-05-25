import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class RestService {
  constructor (private http: HttpClient) {}

  public generalPost (url: string, info: object) {
    return this.http.post<any>(url, info);
  }

  public generalGet (url: string) {
    return this.http.get<any>(url)
  }

  public generalPatch (url: string, info: object) {
    return this.http.patch<any>(url, info);
  }
  
}
