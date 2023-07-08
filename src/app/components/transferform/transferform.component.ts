import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import Swal from 'sweetalert2'
import { switchMap, catchError } from 'rxjs/operators';
import { RestService } from 'src/app/services/rest.service'
import {
  apiopenpay,
  dashboardopenpay,
  apigproducts
} from 'src/app/services/config'
import { FormControl, FormGroup, Validators } from '@angular/forms'
@Component({
  selector: 'app-transferform',
  templateUrl: './transferform.component.html',
  styleUrls: ['./transferform.component.scss']
})
export class TransferformComponent implements OnInit {
  @Input() item = ''
  @Input() generalInfo: any
  receivedData: any = {};

  transferForm: FormGroup;
  objCard: any
  objPayment: any
  customerid: string = ''
  urlpdf: string = ''
  emailTyped: string = ''
  chickedSend: boolean = false
  errorEmail: boolean = false

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService,
    private cdr: ChangeDetectorRef
  ) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    this.transferForm = new FormGroup({
      email: new FormControl('',[Validators.required, Validators.pattern(emailRegex)])
    });
  }

  ngOnInit (): void {}

  ngOnChanges (): void {
    this.receivedData = this.generalInfo;
    this.cdr.detectChanges();
    this.transferForm.get('email')?.setValue(this.receivedData.email);
  }

  onTypeEmail (event: any) {
    this.chickedSend = false
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(event.target.value.match(mailformat))
    {
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

    if (this.transferForm.valid) {
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
      let email = this.transferForm.get('email')?.value;
      const objstore = {
        customerid: this.customerid,
        email,
        data: {
          method: 'bank_account',
          amount: this.receivedData?.total.toFixed(2),
          description: this.receivedData.nameProduct
        }
      }

      let res: any = {};
      this.RestService.generalPost(
        `${apiopenpay}/charge/store`,
        objstore
      ).pipe(
        switchMap(
          (res1) => {
            res = res1;
            //enviar datos DB
            const objToSave = {
              id_moodle_alumno: parseInt(this.receivedData?.userId),
              id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
              id_moodle_materia: this.receivedData.id_moodle_materia ?? null,
              monto: res1?.amount,
              id_servicio: parseInt(this.generalInfo?.id_servicio),
              status: res1?.status,
              order_id: res1?.payment_method?.name,
              authorization: res1?.authorization,
              id: res1?.id,
              cardinfo: null,
              type_payment: 'spei'
            }

            return this.RestService.generalPost(`${apigproducts}/pasarela/registrar_pago`, objToSave);
          }
        ),
        catchError(
          (err) => {
            throw err;
          }
        )
      ).subscribe({
        next: (res2) => {
          //success
          if (res2.success && res2.data[0].success == 1) {
            this.urlpdf = `${dashboardopenpay}/spei-pdf/m8qrwxynurdz6r7m9p4i/${res?.id}`
            const htmlContent = `<a class="btn btn-primary" href="${this.urlpdf}" target="_blank">Descargar pdf</a>`
            Swal.fire({
              icon: 'success',
              title: 'Se ha generado con exito tu voucher',
              html: htmlContent,
              showCancelButton: true,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false
            })
          }else{
            this.getErrorGeneral();
          }
        },
        error:(error)=>{          
          this.getErrorGeneral();
        },
        complete: ()=>{
          console.log('HTTP request completed.')
        }
      })

     
    } catch (error) {
      this.getErrorGeneral()
    }
  }

  updateEmail (openid: any) {
      let email = this.transferForm.get('email')?.value;
    
      this.receivedData.openid = openid ? openid : this.generalInfo.idopenpay
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
