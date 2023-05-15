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
  selector: 'app-transferform',
  templateUrl: './transferform.component.html',
  styleUrls: ['./transferform.component.scss']
})
export class TransferformComponent implements OnInit {
  @Input() item = ''
  @Input() generalInfo: any

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



  sendticket () {
    Swal.showLoading()
  }

  
}
