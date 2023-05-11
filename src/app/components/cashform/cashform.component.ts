import { Component, OnInit, Input } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import Swal from 'sweetalert2'
import { RestService } from 'src/app/services/rest.service'
import {
  urlopenpay,
  apiopenpay,
  apigproducts,
  dashboardopenpay
} from 'src/app/services/config'
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
  customerid: string = ''
  urlpdf: string = ''

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService
  ) {}

  ngOnInit (): void {}

  createcustomer () {
    const customerRequest = {
      name: this.generalInfo.username + this.generalInfo.lastName,
      email: this.generalInfo.email,
      requires_account: false
    }

    this.RestService.generalPost(
      `${apiopenpay}/charge/create_customer`,
      customerRequest
    ).subscribe(resp => {
      if (resp && resp?.id) {
        this.customerid = resp?.id
        this.getstorepayment()
      }
    })
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
    const objstore = {
      customerid: this.customerid,
      data: {
        method: 'store',
        amount: this.generalInfo?.total.toFixed(2),
        description: this.generalInfo.nameProduct
      }
    }
    this.RestService.generalPost(
      `${apiopenpay}/charge/store`,
      objstore
    ).subscribe(resp => {
      if (resp?.payment_method) {
        this.urlpdf = `${dashboardopenpay}/paynet-pdf/mbipwocgkvgkndoykdgg/${resp?.payment_method?.reference}`
        const htmlContent = `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`;
        Swal.fire({
          icon: 'success',
          title: 'Se ha generado con exito tu voucher',
          html: htmlContent,
          //text: `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`,
          showCancelButton: true,
          showConfirmButton: false
        })
      }
    })
  }
}
