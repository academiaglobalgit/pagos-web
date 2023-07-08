import { Component, OnInit, Input, NgModule, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import Swal from 'sweetalert2'
import { RestService } from 'src/app/services/rest.service'
import { apiopenpay, apigproducts } from 'src/app/services/config'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { switchMap, catchError } from 'rxjs/operators';

declare var OpenPay: any

OpenPay.setId('m8qrwxynurdz6r7m9p4i')
OpenPay.setApiKey('pk_2e2c7d4430844bcdb23fb3b50f37f782')
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
  @Input() item = '';
  @Input() generalInfo: any;
  receivedData : any;
  @Input() typeEmail: any;

  cardForm: FormGroup;
  objCard: any
  objPayment: any

  constructor (
    private route: ActivatedRoute,
    private RestService: RestService,
    private cdr: ChangeDetectorRef
  ) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let cardNumberRegex = /^[0-9\s]{13,19}$/;
    let holderNameRegex = /^([A-ZÁÉÍÓÚÑa-záéíóúñ][a-záéíóúñ]+\s?){1,3}([A-ZÁÉÍÓÚÑa-záéíóúñ][a-záéíóúñ]+)?$/;
    let expirationMonthRegex = /^(0[1-9]|1[0-2])$/;
    let expirationYearRegex = /^([1-9][0-9])$/;
    let cvv2Regex = /^\d{3,4}/;

    this.cardForm = new FormGroup({
      email: new FormControl('',[Validators.required, Validators.pattern(emailRegex)]),
      card_number: new FormControl('',[Validators.required, Validators.pattern(cardNumberRegex), Validators.maxLength(16)]),
      holder_name: new FormControl('',[Validators.required, Validators.pattern(holderNameRegex)]),
      expiration_month: new FormControl('',[Validators.required, Validators.pattern(expirationMonthRegex)]),
      expiration_year: new FormControl('',[Validators.required, Validators.pattern(expirationYearRegex)]),
      cvv2: new FormControl('', [Validators.required, Validators.pattern(cvv2Regex)])
    });
  }

  ngOnInit (): void {}

  ngOnChanges (): void {
    this.receivedData = this.generalInfo;
    this.cdr.detectChanges();
    this.cardForm.get('email')?.setValue(this.receivedData.email);
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

  updateEmail(){
    if(!this.generalInfo.email){
      let email = this.cardForm.get('email')?.value;
      const objToUpdate = {
        id_moodle_alumno: parseInt(this.receivedData?.userId),
        id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
        email,
        id_open_pay: this.receivedData.idopenpay
      }

      this.RestService.generalPatch(
        `${apigproducts}/pasarela/actualizar_open_pay`,
        objToUpdate
      ).subscribe(responseRegister => {
        console.log('update_info_email', responseRegister)
      })
    }
  }

  SuccessCallbackRegister (response: any) {
    if (response?.data && response?.data?.id) {
      let amount = parseFloat(this.receivedData?.total).toFixed(2);
      let description  = this.receivedData?.nameProduct;
      let name = this.receivedData?.username;
      let last_name = this.receivedData?.last_name;
      let email = this.cardForm.get('email')?.value;

      const objPayment = {
        source_id: response?.data?.id,
        method: 'card',
        amount,
        currency: 'MXN',
        description,
        device_session_id: deviceSessionId,
        customer: {
          name,
          last_name,
          phone_number: '1111111111',
          email
        }
      }

      //validar materia
      if (typeof(this.receivedData.id_moodle_materia) == 'undefined' && this.receivedData.id_tipo_servicio == 12) {
        Swal.fire({
          icon: 'error',
          title:'Fallo en pago',
          html: '<label>Es necesario una materia para este servicio.<strong>',
          showCancelButton: false,
          showConfirmButton: true
        })
        return;
      }

      try {

        let res = {};
        this.RestService.generalPost(`${apiopenpay}/charge/card`,objPayment)
          .pipe(
            switchMap(
              (res1) => {
                res = res1;
                console.log('respuesta', res1);
                // if (res1.id) {
                //   this.showAlert(res1);
                // }
                let order_id = res1?.id;

                const objToSave = {
                  id_moodle_alumno: parseInt(this.receivedData?.userId),
                  id_plan_estudio: parseInt(this.receivedData.id_plan_estudio),
                  id_moodle_materia: this.receivedData.id_moodle_materia ?? null,
                  monto: parseFloat(res1?.amount),
                  id_servicio: parseInt(this.receivedData?.id_servicio),
                  status: res1?.status,
                  order_id: order_id,
                  authorization: res1?.authorization,
                  id: res1?.id,
                  cardinfo: res1?.card,
                  type_payment: 'card'
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
            next: (resp2)=>{
              console.log('resp2', resp2);
              this.showAlert(res);
            },
            error:(err)=>{
              console.log('err', err);
              this.getErrorGeneral();
            },
            complete: ()=>{
              console.log('HTTP request completed.')
              this.cardForm.reset();
            }
          })

      } catch (error) {
        this.getErrorGeneral()
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

  showAlert(resp: any){
    let order_id = resp?.id;
    let titleMsg = '',
                  descriptionMsg = ''
    switch (resp?.status) {
      case 'completed':
        titleMsg = 'Pago exitoso'
        descriptionMsg = `<label>En seguida recibiras un correo con tu pago, tu número de referencia es: <strong>${order_id}</strong></label>`
        break
      case 'in_progress':
        titleMsg = 'Tu pago esta en proceso'
        descriptionMsg = `<label>Aún no hemos pasado tu pago, favor de revisar tu bandeja de correo para ver cambio de estatus o comunicate con nuestros atención a clientes, tu número de referencia es: <strong>${order_id}</strong></label>`
        break
      case 'failed':
        titleMsg = 'Fallo en pago'
        descriptionMsg = `<label>Tu pago no ha sido procesado favor de volverlo a intentar, tu número de referencia es: <strong>${order_id}</strong></label>`
        break
      default:
        break
    }

    Swal.fire({
      icon: 'success',
      title: titleMsg,
      html: descriptionMsg,
      showCancelButton: false,
      showConfirmButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    })
  }

  sendpay (){
    const {
      card_number,
      holder_name,
      expiration_year,
      expiration_month,
      cvv2,
      email
    } = this.cardForm.value

    let amount = parseFloat(this.receivedData?.total).toFixed(2);
    let description = this.receivedData?.nameProduct;

    console.log('receivedDAta', this.receivedData);
    
    
    if (this.cardForm.valid) {
        this.objCard = {
          card_number,
          holder_name,
          expiration_year,
          expiration_month,
          cvv2,
          amount,
          description
        }

        // Swal.showLoading();
        Swal.fire({
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: ()=>{
            Swal.showLoading();
          }
        });
        OpenPay.token.create(
          this.objCard,
          (successResponse: any) => {
            this.SuccessCallbackRegister(successResponse)
          },
          this.ErrorCallbackRegister
        )

        this.updateEmail();
    }
    
    
  }
}
