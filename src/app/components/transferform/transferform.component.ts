import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import Swal from 'sweetalert2'
import { RestService } from 'src/app/services/rest.service'
import {
  apiopenpay,
  dashboardopenpay,
  apigproducts
} from 'src/app/services/config'
@Component({
  selector: 'app-transferform',
  templateUrl: './transferform.component.html',
  styleUrls: ['./transferform.component.scss']
})
export class TransferformComponent implements OnInit {
  @Input() item = ''
  @Input() generalInfo: any

  objCard: any
  objPayment: any
  customerid: string = ''
  urlpdf: string = ''
  emailTyped: string = ''

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  ngOnInit (): void {}

  onTypeEmail (event: any) {
    this.emailTyped = event.target.value
  }

  getErrorGeneral () {
    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'No se pudo completar la petición, intenta nuevamente',
        footer: ''
      })
    }, 600)
  }

  createcustomer () {
    const customerRequest = {
      name: this.generalInfo.username + ' ' + this.generalInfo.lastName,
      email: this.generalInfo.email ? this.generalInfo.email
      : this.emailTyped,
      requires_account: false
    }

    this.RestService.generalPost(
      `${apiopenpay}/charge/create_customer`,
      customerRequest
    ).subscribe(
      resp => {
        if (resp && resp?.id) {
          this.customerid = resp?.id
          this.getstorepayment()
        }
      },
      err => {
        this.getErrorGeneral()
      },
      () => console.log('HTTP request completed.')
    )
  }

  sendpay () {
    if (this.generalInfo?.email || this.emailTyped) {
      if (this.generalInfo?.idopenpay) {
        this.customerid = this.generalInfo?.idopenpay
        this.getstorepayment()
      } else {
        this.createcustomer()
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Necesitas agregar tu correo, para poder continuar',
        footer: ''
      })
    }
  }

  getstorepayment () {
    Swal.showLoading()
    //crear voucher
    try {
      const objstore = {
        customerid: this.customerid,
        data: {
          method: 'bank_account',
          amount: this.generalInfo?.total.toFixed(2),
          description: this.generalInfo.nameProduct
        }
      }
      this.RestService.generalPost(
        `${apiopenpay}/charge/store`,
        objstore
      ).subscribe(
        resp => {
          if (resp?.payment_method?.name) {
            //success
            this.urlpdf = `${dashboardopenpay}/spei-pdf/mbipwocgkvgkndoykdgg/${resp?.id}`
            const htmlContent = `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`
            Swal.fire({
              icon: 'success',
              title: 'Se ha generado con exito tu voucher',
              html: htmlContent,
              showCancelButton: true,
              showConfirmButton: false
            })

            //enviar datos DB
            const objToSave = {
              id_moodle_alumno: parseInt(this.generalInfo?.userId),
              id_plan_estudio: parseInt(this.generalInfo.id_plan_estudio),
              monto: resp?.amount,
              id_servicio: parseInt(this.generalInfo?.id_servicio),
              status: resp?.status,
              order_id: resp?.payment_method?.name,
              authorization: resp?.authorization,
              id: resp?.id,
              cardinfo: null,
              type_payment: 'spei'
            }
            this.RestService.generalPost(
              `${apigproducts}/pasarela/registrar_pago`,
              objToSave
            ).subscribe(responseRegister => {
              console.log('save_product_bought', responseRegister)
            })

            //update idemail
            if(!this.generalInfo.email && this.emailTyped){
              const objToUpdate = {
                id_moodle_alumno: parseInt(this.generalInfo?.userId),
                id_plan_estudio: parseInt(this.generalInfo.id_plan_estudio),
                email: this.emailTyped
              }

              this.RestService.generalPatch(
                `${apigproducts}/pasarela/actualizar_open_pay`,
                objToUpdate
              ).subscribe(responseRegister => {
                console.log('update_info_user', responseRegister)
              })
            }
          }
        },
        err => {
          this.getErrorGeneral()
        },
        () => console.log('HTTP request completed.')
      )
    } catch (error) {
      this.getErrorGeneral()
    }
  }

  
}
