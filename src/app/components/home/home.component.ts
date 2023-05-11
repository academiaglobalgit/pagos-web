import { Component, OnInit, Input } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { RestService } from 'src/app/services/rest.service'
import { apigproducts } from 'src/app/services/config'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  idProduct: string = ''
  nameProduct: string = 'Credencial'
  priceProduct: number = 820
  chargeService: number = 0
  @Input() total: number = 0
  userId: string = ''
  username: string = 'Andrea'
  lastName: string = 'Jimenez'
  email: string = 'andrea2@gmail.com'
  idopenpay: string = 'ah9wuhgeewppulrcu3zr'
  id_plan_estudio: number = 1;
  dataInfo = {}
  //dataProduct: any;

  ngOnInit (): void {
    this.route.queryParams.subscribe(params => {
      this.idProduct = params?.idproduct
      this.userId = params?.userid

      this.getProductInfo(params?.idproduct)
      this.getUserInfo(params?.userid)
    })
  }

  public getProductInfo (idproduct: string) {
    if (idproduct) {
      try {
        this.RestService.generalGet(
          `${apigproducts}/pasarela/get_servicios`
        ).subscribe(resp => {
          console.log('get', resp);
          /*
          if(resp?.data?.length){
            const dataProduct = resp.data;
            for (let index = 0; index < dataProduct.length; index++) {
              const element = dataProduct[index];
              
              if(element.id === idproduct){
                this.nameProduct = element.nombre
                this.priceProduct = element.precio
              }
            }
          }*/
        })
      } catch (error) {}

      this.chargeService = (this.priceProduct * 2.9) / 100 + 2.5

      this.total = this.chargeService + this.priceProduct

      this.dataInfo = {
        total: this.total,
        nameProduct: this.nameProduct,
        userId: this.userId,
        idProduct: this.idProduct,
        username: this.username,
        lastName: this.lastName,
        email: this.email,
        idopenpay: this.idopenpay
      }
    }
  }

  public getUserInfo (userid: string) {
    if (userid) {
      //this.username
      //this.lastName
      //this.email
      //this.id_plan_estudio

      //this.RestService.generalGet(apigproducts + 'user/' + userid).subscribe(resp => {
      //})
    }
  }
}
