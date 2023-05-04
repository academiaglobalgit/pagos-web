import { Component, OnInit, Input } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
declare var OpenPay: any

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

  constructor (private route: ActivatedRoute) {}

  ngOnInit (): void {}



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
      method: 'store',
      amount: this.generalInfo?.total.toFixed(2),
      description: this.generalInfo.nameProduct
    }

    console.log('charges', OpenPay); debugger
    
    OpenPay.token.create(
      this.objCard,
      this.SuccessCallbackRegister,
      this.ErrorCallbackRegister
    )
    //OpenPay.token.create(this.objPayment, this.SuccessCallback, this.ErrorCallback);
  }
}
