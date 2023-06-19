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
  nameProduct: string = ''
  priceProduct: number = 0
  chargeService: number = 0
  id_moodle_materia: any = null
  //@Input() total: number = 0
  userId: number = 0
  username: string = ''
  lastName: string = ''
  email: string = ''
  idopenpay: string = ''
  id_plan_estudio: number = 0
  id_servicio: number = 0
  dataInfo = {}
  ItemsResponse: any
  //dataProduct: any;

  ngOnInit (): void {
    this.route.queryParams.subscribe(params => {
      this.idProduct = params?.idproduct
      this.userId = params?.userid
      this.id_plan_estudio = params?.idplanestudio
      this.id_moodle_materia = params.idmoodlemateria;

      this.getProductInfo(params?.idproduct)
      this.getUserInfo(params?.userid)
    })
  }

  public async getProductInfo (idproduct: string) {
    if (idproduct) {
      try {
        this.RestService.generalGet(
          `${apigproducts}/pasarela/get_servicios?pe=${this.id_plan_estudio}`
        ).subscribe(resp => {
          if (resp?.data?.length) {
            const dataProduct = resp.data
            for (let index = 0; index < dataProduct.length; index++) {
              const element = dataProduct[index]
              if (element.id_servicio === parseInt(idproduct)) {
                this.nameProduct = element.nombre
                const priceProduct = element.monto ? element.monto : 1.0

                const chargeService = (priceProduct * 2.9) / 100 + 2.5
                this.chargeService = chargeService
                this.priceProduct = priceProduct
                const total = chargeService + priceProduct
                //this.total = chargeService + priceProduct

                this.dataInfo = {
                  ...this.dataInfo,
                  ...{
                    total: total,
                    nameProduct: element.nombre,
                    idProduct: this.idProduct,
                    id_servicio: element.id_servicio,
                    id_moodle_materia: this.id_moodle_materia,
                    id_tipo_servicio: element.id_tipo_servicio
                  }
                }
              }
            }
          }
        })
      } catch (error) {}
    }
  }

  public getUserInfo (userid: number) {
    if (userid) {
      this.RestService.generalGet(
        apigproducts +
          `/pasarela/get_informacion_usuario?pe=${this.id_plan_estudio}&ma=${this.userId}`
      ).subscribe(resp => { 
        if (resp?.data) {
          let data = resp.data;
          data = data[0];
          this.dataInfo = {
            ...this.dataInfo,
            ...{
              userId: this.userId,
              username: data.nombre,
              lastName: data.apellido_paterno,
              email: data.email,
              idopenpay: data.id_open_pay,
              id_plan_estudio: this.id_plan_estudio,
              id_moodle_materia: this.id_moodle_materia
            }
          }
        }
      })
    }
  }
}
