import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import Swal from 'sweetalert2'
import { RestService } from 'src/app/services/rest.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { switchMap, catchError } from 'rxjs/operators';

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
  receivedData: any = {};
  cashForm: FormGroup;
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
    private RestService: RestService,
    private cdr: ChangeDetectorRef
  ) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    this.cashForm = new FormGroup({
      email: new FormControl('',[Validators.required, Validators.pattern(emailRegex)]),
    });
  }

  ngOnInit (): void {
    // this.askemail = this.generalInfo?.email
  }

  ngOnChanges (): void {
    this.receivedData = this.generalInfo;
    this.cdr.detectChanges();
    this.cashForm.get('email')?.setValue(this.receivedData.email);
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
    if (this.cashForm.valid) {
      // let email = this.cashForm.get('email')?.value;
      if (this.receivedData.idopenpay) {
        this.customerid = this.generalInfo?.idopenpay;
        this.getstorepayment()
      }else{
        this.createcustomer()
      }
      
    }
  }

  getstorepayment (addedopenpay: Boolean = false) {
    let email = this.cashForm.get('email')?.value;
    Swal.showLoading()
    //actualizar si no es nuevo usuario
    if (!addedopenpay) {
      this.updateEmail('')
    }

    //validar materia
    if (
      typeof this.receivedData.id_moodle_materia == 'undefined' &&
      this.receivedData.id_tipo_servicio == 12
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
        email,
        data: {
          method: 'store',
          amount: parseFloat(this.receivedData?.total.toFixed(2)),
          description: this.receivedData.nameProduct
        }
      }

      let res: any = {};
      this.RestService.generalPost(
        `${apiopenpay}/charge/store`,
        objstore
      ).pipe(
          switchMap(
            (res1, index) => {
              res = res1;
              //enviar datos DB
              const objToSave = {
                id_moodle_alumno: parseInt(this.receivedData?.userId),
                id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
                id_moodle_materia: this.receivedData.id_moodle_materia ?? null,
                monto: res1?.amount,
                id_servicio: parseInt(this.receivedData?.id_servicio),
                status: res1?.status,
                order_id: res1?.payment_method?.reference,
                authorization: res1?.authorization,
                id: res1?.id,
                cardinfo: null,
                type_payment: 'cash'
              }

              return this.RestService.generalPost(`${apigproducts}/pasarela/registrar_pago`,objToSave);
            }
          
          ),
          catchError(
            (err)=>{
              throw err;
            }
          )
      ).subscribe({
        next: (res2) =>{
          console.log('res2', res2);
          
          
          this.urlpdf = `${dashboardopenpay}/paynet-pdf/m8qrwxynurdz6r7m9p4i/transaction/${res?.id}`
          const htmlContent = `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`
          Swal.fire({
            icon: 'success',
            title: 'Se ha generado con exito tu voucher',
            html: htmlContent,
            showCancelButton: true,
            showConfirmButton: false
          });

        },
        error: (err) =>{
          this.getErrorGeneral();
        },
        complete: () => {
            console.log('HTTP request completed.')
            // this.cashForm.reset();
        }
      });

      // this.RestService.generalPost(
      //   `${apiopenpay}/charge/store`,
      //   objstore
      // ).subscribe(
      //   resp => {
      //     if (resp?.payment_method) {
      //       //success
      //       this.urlpdf = `${dashboardopenpay}/paynet-pdf/m8qrwxynurdz6r7m9p4i/transaction/${resp?.id}`
      //       const htmlContent = `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`
      //       Swal.fire({
      //         icon: 'success',
      //         title: 'Se ha generado con exito tu voucher',
      //         html: htmlContent,
      //         showCancelButton: true,
      //         showConfirmButton: false
      //       })

      //       //enviar datos DB
      //       const objToSave = {
      //         id_moodle_alumno: parseInt(this.receivedData?.userId),
      //         id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
      //         id_moodle_materia: this.receivedData.id_moodle_materia ?? null,
      //         monto: resp?.amount,
      //         id_servicio: parseInt(this.receivedData?.id_servicio),
      //         status: resp?.status,
      //         order_id: resp?.payment_method?.reference,
      //         authorization: resp?.authorization,
      //         id: resp?.id,
      //         cardinfo: null,
      //         type_payment: 'cash'
      //       }
      //       this.RestService.generalPost(
      //         `${apigproducts}/pasarela/registrar_pago`,
      //         objToSave
      //       ).subscribe(responseRegister => {
      //         console.log('save_product_bought', responseRegister)
      //       })
      //     }
      //   },
      //   err => {
      //     this.getErrorGeneral()
      //   },
      //   () => console.log('HTTP request completed.')
      // )
    } catch (error) {
      this.getErrorGeneral()
    }
  }

  updateEmail (openid: any) {
    let email = this.cashForm.get('email')?.value;

    
    this.receivedData.openid = openid ? openid : this.receivedData.idopenpay
    const objToUpdate = {
      id_moodle_alumno: parseInt(this.receivedData?.userId),
      id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
      email,
      id_open_pay: openid ? openid : this.receivedData.idopenpay
    }

    this.RestService.generalPatch(
      `${apigproducts}/pasarela/actualizar_open_pay`,
      objToUpdate
    ).subscribe(responseRegister => {
      console.log('update_info_email', responseRegister)
    })
    
  }
}
