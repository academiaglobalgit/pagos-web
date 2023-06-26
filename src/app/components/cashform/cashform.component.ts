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
  askemail: boolean = false
  emailTyped: string = ''
  chickedSend: boolean = false
  errorEmail: boolean = false

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  ngOnInit (): void {
    this.askemail = this.generalInfo?.email
  }

  onTypeEmail (event: any) {
    this.chickedSend = false
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (event.target.value.match(mailformat)) {
      this.generalInfo.email = event.target.value
      this.errorEmail = false
    } else this.errorEmail = true
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
          this.updateEmail(resp?.id)

          //process payment
          this.getstorepayment(true)
        }
      },
      err => {
        this.getErrorGeneral()
      },
      () => console.log('HTTP request completed.')
    )
  }

  sendpay () {
    this.chickedSend = true
    if(!this.errorEmail){
      if (this.generalInfo?.idopenpay) {
        this.customerid = this.generalInfo?.idopenpay
        this.getstorepayment()
      } else {
        this.createcustomer()
      }
    }
  }

  getstorepayment (addedopenpay: Boolean = false) {
    Swal.showLoading()
    //actualizar si no es nuevo usuario
    if (!addedopenpay) {
      this.updateEmail('')
    }

    //validar materia
    if (
      typeof this.generalInfo.id_moodle_materia == 'undefined' &&
      this.generalInfo.id_tipo_servicio == 12
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Fallo en pago',
        html: '<label>Es necesario una materia para este servicio.<strong>',
        showCancelButton: false,
        showConfirmButton: true
      })
      return
    }

    //crear voucher
    try {
      const objstore = {
        customerid: this.customerid,
        email: this.generalInfo.email,
        data: {
          method: 'store',
          amount: this.generalInfo?.total.toFixed(2),
          description: this.generalInfo.nameProduct
        }
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

  updateEmail (openid: any) {
    if (this.generalInfo.email) {
      this.generalInfo.openid = openid ? openid : this.generalInfo.idopenpay
      const objToUpdate = {
        id_moodle_alumno: parseInt(this.generalInfo?.userId),
        id_plan_estudio: parseInt(this.generalInfo.id_plan_estudio),
        email: this.generalInfo.email,
        id_open_pay: openid ? openid : this.generalInfo.idopenpay
      }

      this.RestService.generalPatch(
        `${apigproducts}/pasarela/actualizar_open_pay`,
        objToUpdate
      ).subscribe(responseRegister => {
        console.log('update_info_email', responseRegister)
      })
    }
  }
}
