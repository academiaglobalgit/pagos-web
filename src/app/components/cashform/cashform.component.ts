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
  selector: 'app-cashform',
  templateUrl: './cashform.component.html',
  styleUrls: ['./cashform.component.scss']
})
export class CashComponent implements OnInit {
  @Input() item = ''
  @Input() generalInfo: any

  objCard: any
  objPayment: any
  customerid: string = ''
  urlpdf: string = ''

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  ngOnInit (): void {}

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
      email: this.generalInfo.email,
      requires_account: false
    }

    this.RestService.generalPost(
      `${apiopenpay}/charge/create_customer`,
      customerRequest
    ).subscribe(
      resp => {
        if (resp && resp?.id) {
          this.customerid = resp?.id

          //update idopenpay
          const objToSave = {
            id_moodle_alumno: parseInt(this.generalInfo?.userId),
            id_plan_estudio: parseInt(this.generalInfo.id_plan_estudio),
            id_open_pay: resp?.id,
            email: this.generalInfo.email
          }

          this.RestService.generalPatch(
            `${apigproducts}/pasarela/actualizar_open_pay`,
            objToSave
          ).subscribe(responseRegister => {
            console.log('update_info_user', responseRegister)
          })

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
    if (this.generalInfo?.idopenpay) {
      this.customerid = this.generalInfo?.idopenpay
      this.getstorepayment()
    } else {
      this.createcustomer()
    }
  }

  getstorepayment () {
    Swal.showLoading()
    //crear voucher
    try {
      const objstore = {
        customerid: this.customerid,
        data: {
          method: 'store',
          amount: this.generalInfo?.total.toFixed(2),
          description: this.generalInfo.nameProduct
        }
      }

      if (typeof(this.generalInfo.id_moodle_materia) == 'undefined' && this.generalInfo.id_tipo_servicio == 12) {
        Swal.fire({
          icon: 'error',
          title:'Fallo en pago',
          html: '<label>Es necesario una materia para este servicio.<strong>',
          showCancelButton: false,
          showConfirmButton: true
        })
        return;
      }


      this.RestService.generalPost(
        `${apiopenpay}/charge/store`,
        objstore
      ).subscribe(
        resp => {
          if (resp?.payment_method) {
            //success
            this.urlpdf = `${dashboardopenpay}/paynet-pdf/mbipwocgkvgkndoykdgg/${resp?.payment_method?.reference}`
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
              id_moodle_materia: this.generalInfo.id_moodle_materia ?? null,
              monto: resp?.amount,
              id_servicio: parseInt(this.generalInfo?.id_servicio),
              status: resp?.status,
              order_id: resp?.payment_method?.reference,
              authorization: resp?.authorization,
              id: resp?.id,
              cardinfo: null,
              type_payment: 'cash'
            }
            this.RestService.generalPost(
              `${apigproducts}/pasarela/registrar_pago`,
              objToSave
            ).subscribe(responseRegister => {
              console.log('save_product_bought', responseRegister)
            })
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
