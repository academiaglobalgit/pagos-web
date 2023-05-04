import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
//var Openpay = require('openpay');
//import * as  Openpay  from "openpay";
//var openpay = new Openpay('mbipwocgkvgkndoykdgg', 'sk_252732b74920457099f62651857894ef', false);

@Component({
  selector: 'app-cardform',
  templateUrl: './cardform.component.html',
  styleUrls: ['./cardform.component.scss']
})
export class CardComponent implements OnInit {

  card_number: string = ''
  holder_name: string = ''
  expiration_year: string = ''
  expiration_month: string = ''
  cvv2: string = ''
  objPayment: object = {}


  constructor(private route: ActivatedRoute) { }

  

  ngOnInit(): void {
    
  }

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

  sendpay () {
    //OpenPay.setId('MERCHANT_ID');
    //OpenPay.setApiKey('PUBLIC_API_KEY');


    this.objPayment = {
      method: 'card',
      card: {
        card_number: this.card_number,
        holder_name: this.holder_name,
        expiration_year: this.expiration_year,
        expiration_month: this.expiration_month,
        cvv2: this.cvv2,
      },
      amount : 200.00,
      description : 'Test',
      order_id : "oid-00721"
    }



  }


}
