import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  idProduct: string = ''
  nameProduct: string = ''
  priceProduct: string = ''
  userid: string = ''

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.idProduct = params['idproduct'];
        this.userid = params['userid'];
        //console.log(params); // { orderby: "price" }
        //this.orderby = params.orderby;
        //console.log(this.orderby); // price
      }
    );
  }

  public loadProductInfo (idproduct: string) {
    if (idproduct) {
      /*
      this.RestService.getuser(baseapi + 'user/' + userid).subscribe(resp => {

      })*/
    }
  }

}
