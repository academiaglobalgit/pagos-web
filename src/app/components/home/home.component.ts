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
  username: string = ''
  lastName: string = ''
  email: string = ''
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
        this.RestService.getuser(
          `${apigproducts}/pasarela/get_servicios`
        ).subscribe(resp => {
          if(resp?.data?.length){
            const dataProduct = resp.data;
            for (let index = 0; index < dataProduct.length; index++) {
              const element = dataProduct[index];
              
              if(element.id === idproduct){
                this.nameProduct = element.nombre
                this.priceProduct = element.precio
              }
            }
          }
        })
      } catch (error) {}
      
      this.chargeService = (this.priceProduct * 2.9) / 100 + 2.5

      this.total = this.chargeService + this.priceProduct

      this.dataInfo = {
        total: this.total,
        nameProduct: this.nameProduct
      }
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
