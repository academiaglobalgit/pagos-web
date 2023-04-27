import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
//import { Openpay } from 'openpay';
//var openpay = new Openpay('mbipwocgkvgkndoykdgg', 'sk_252732b74920457099f62651857894ef', 'mx', false);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  idProduct: string = ''
  nameProduct: string = ''
  priceProduct: number = 0;
  chargeService: number = 0;
  userId: string = '';
  username: string = '';
  lastName: string = '';
  email: string = '';
  

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.idProduct = params?.idproduct;
        this.userId = params?.userid;

        this.getProductInfo(params?.idproduct);
        this.getUserInfo(params?.userid);
      }
    );
  }

  public getProductInfo (idproduct: string) {
    if (idproduct) {
      //this.RestService.getuser(baseapi + 'user/' + userid).subscribe(resp => {
      //})
      this.nameProduct = 'Test producto';
      this.priceProduct = 820.59;

      this.chargeService = (820.59 * 2.9 / 100) + 2.5;
    }
  }

  public getUserInfo (userid: string) {
    if (userid) {
      //this.RestService.getuser(baseapi + 'user/' + userid).subscribe(resp => {
      //})
      //this.nameProduct = 'Test producto';
      //this.priceProduct = 820.59;

      //calcular servicio 
      
    }
  }

}
