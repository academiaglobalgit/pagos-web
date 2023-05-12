import { Component, OnInit, Input } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import Swal from 'sweetalert2'
import { RestService } from 'src/app/services/rest.service'
import { apiopenpay, apigproducts } from 'src/app/services/config'
declare var OpenPay: any
//const openpay = new OpenPay('mbipwocgkvgkndoykdgg','pk_17b9d41b42464ddb8b707aa6141dd530', [ false ]);
OpenPay.setId('mbipwocgkvgkndoykdgg')
OpenPay.setApiKey('pk_17b9d41b42464ddb8b707aa6141dd530')
OpenPay.setSandboxMode(true)
const deviceSessionId = OpenPay.deviceData.setup(
  'payment-form',
  'deviceIdHiddenFieldName'
)
const timerLoading = 600
@Component({
  selector: 'app-cardform',
  templateUrl: './cardform.component.html',
  styleUrls: ['./cardform.component.scss']
})
export class CardComponent implements OnInit {
  @Input() item = ''
  @Input() generalInfo: any

  card_number: string = ''
  holder_name: string = ''
  expiration_year: string = ''
  expiration_month: string = ''
  cvv2: string = ''
  objCard: any
  objPayment: any
  chickedSend: boolean = false

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  ngOnInit (): void {}

  onTypeNumber (event: any) {
    this.card_number = event.target.value
    this.chickedSend = false
  }
  onTypeName (event: any) {
    this.holder_name = event.target.value
    this.chickedSend = false
  }
  onTypeExpirationYear (event: any) {
    this.expiration_year = event.target.value
    this.chickedSend = false
  }
  onTypeExpirationMonth (event: any) {
    this.expiration_month = event.target.value
    this.chickedSend = false
  }
  onTypeCCV (event: any) {
    this.cvv2 = event.target.value
    this.chickedSend = false
  }

  SuccessCallbackRegister (response: any) {
    if (response?.data && response?.data?.id) {
      const objPayment = {
        source_id: response?.data?.id,
        method: 'card',
        amount: this.generalInfo?.total.toFixed(2),
        currency: 'MXN',
        description: this.generalInfo.nameProduct,
        device_session_id: deviceSessionId,
        customer: {
          name: 'Juan',
          last_name: 'Vazquez Juarez',
          phone_number: '4423456723',
          email: 'juan.vazquez@empresa.com.mx'
        }
      }

      try {
        this.RestService.generalPost(
          `${apiopenpay}/charge/card`,
          objPayment
        ).subscribe(resp => {
          if (resp) {
            const order_id = resp?.data?.id //resp?.data?.order_id
            if (resp?.data && order_id) {
              let titleMsg = '',
                descriptionMsg = ''
              switch (resp.data?.status) {
                case 'completed':
                  titleMsg = 'Pago exitoso'
                  descriptionMsg = `En seguida recibiras un correo con tu pago, tu número de referencia es: ${order_id}`
                  break
                case 'in_progress':
                  titleMsg = 'Tu pago esta en proceso'
                  descriptionMsg = `Aún no hemos pasado tu pago, favor de revisar tu bandeja de correo para ver cambio de estatus o comunicate con nuestros atención a clientes, tu número de referencia es: ${order_id}`
                  break
                case 'failed':
                  titleMsg = 'Fallo en pago'
                  descriptionMsg = `Tu pago no ha sido procesado favor de volverlo a intentar, tu número de referencia es: ${order_id}`
                  break
                default:
                  break
              }
              Swal.fire({
                icon: 'success',
                title: titleMsg,
                text: descriptionMsg,
                showCancelButton: false,
                showConfirmButton: true
              })
            }
            const objToSave = {
              id_moodle_alumno: parseInt(this.generalInfo?.userId),
              id_plan_estudio: parseInt(this.generalInfo.id_plan_estudio),
              monto: parseFloat(this.generalInfo?.total.toFixed(2)),
              id_servicio: parseInt(this.generalInfo?.idProduct)
              //status
              //order_id
              //authorization
              //id
              //cardinfo
              //type_payment (card, cash)
            }
            this.RestService.generalPost(
              `${apigproducts}/pasarela/registrar_pago`,
              objToSave
            ).subscribe(responseRegister => {
              console.log('save_product_bought', responseRegister)
            })
          } else {
            console.log('error_pago')
          }
        })
      } catch (error) {
        console.log('error_pago')
      }
    }
  }

  ErrorCallbackRegister (response: any) {
    console.log('error_code', response?.data?.error_code)
    let text =
      'Tuvimos un problema al procesar tu pago, favor de intentarlo nuevamente'
    if (
      response?.data?.error_code === 2004 ||
      response?.data?.error_code === 2005 ||
      response?.data?.error_code === 2006
    ) {
      text = 'Favor de revisar tus datos nuevamente'
    }
    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: '¡Pago fallido!',
        text,
        footer: ''
      })
    }, timerLoading)
  }

  sendpay () {
    this.chickedSend = true

    if (
      this.card_number &&
      this.holder_name &&
      this.expiration_year &&
      this.expiration_month &&
      this.cvv2
    ) {
      this.objCard = {
        card_number: this.card_number,
        holder_name: this.holder_name,
        expiration_year: this.expiration_year,
        expiration_month: this.expiration_month,
        cvv2: this.cvv2,
        amount: this.generalInfo?.total.toFixed(2),
        description: this.generalInfo.nameProduct
      }
      Swal.showLoading()
      OpenPay.token.create(
        this.objCard,
        (successResponse: any) => {
          this.SuccessCallbackRegister(successResponse)
        },
        this.ErrorCallbackRegister
      )
    }
  }
}
