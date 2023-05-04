import { Component, OnInit, Input } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
declare var OpenPay: any
//const openpay = new OpenPay('mbipwocgkvgkndoykdgg','pk_17b9d41b42464ddb8b707aa6141dd530', [ false ]);
OpenPay.setId('mbipwocgkvgkndoykdgg')
OpenPay.setApiKey('pk_17b9d41b42464ddb8b707aa6141dd530')
OpenPay.setSandboxMode(true)
/*const deviceSessionId = OpenPay.deviceData.setup(
  'payment-form',
  'deviceIdHiddenFieldName'
)*/

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
  hideModal: string = 'true'

  constructor (private route: ActivatedRoute) {}

  ngOnInit (): void {}

  onTypeNumber (event: any) {
    this.card_number = event.target.value
  }
  onTypeName (event: any) {
    this.holder_name = event.target.value
  }
  onTypeExpirationYear (event: any) {
    this.expiration_year = event.target.value
  }
  onTypeExpirationMonth (event: any) {
    this.expiration_month = event.target.value
  }
  onTypeCCV (event: any) {
    this.cvv2 = event.target.value
  }

  SuccessCallbackPayment (response: any) {
    alert('Success payment')
    console.log('response_success_payment', response)
  }

  ErrorCallbackPayment (response: any) {
    alert('Fallo payment')
    console.log('response_error_payment', response)
  }

  SuccessCallbackRegister (response: any) {
    alert('Enviado exitosamente')
    //console.log('response_success', response)

    /*
    if (response?.data && response?.data?.id) {
      const objPayment = {
        source_id: response?.data?.id,
        method: 'card',
        amount: 900,
        currency: 'MXN',
        description: 'test pago',
        device_session_id: 'deviceSessionId',
        customer: {
          name: 'Juan',
          last_name: 'Vazquez Juarez',
          phone_number: '4423456723',
          email: 'juan.vazquez@empresa.com.mx'
        }
      }; debugger;
      openpayInstance.charges.create(
        objPayment,
        () => {
          console.log('si jalo')
        },
        () => {
          console.log('error en pago')
        }
      )
    }*/
    ///enviar
    /*amount: this.generalInfo?.total.toFixed(2),
        description: this.generalInfo.nameProduct,
        order_id: 'oid-00721'*/
  }

  ErrorCallbackRegister (response: any) {
    alert('Fallo en la transacción')
    console.log('response_error', response)
  }

  sendpay () {
    this.objCard = {
      card_number: this.card_number,
      holder_name: this.holder_name,
      expiration_year: this.expiration_year,
      expiration_month: this.expiration_month,
      cvv2: this.cvv2,
      amount: this.generalInfo?.total.toFixed(2),
      description: this.generalInfo.nameProduct
    }

    OpenPay.token.create(
      this.objCard,
      this.SuccessCallbackRegister,
      this.ErrorCallbackRegister
    )
    //OpenPay.token.create(this.objPayment, this.SuccessCallback, this.ErrorCallback);
  }
}
