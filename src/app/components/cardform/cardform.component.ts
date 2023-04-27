import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
//import { Openpay } from 'openpay';
//var openpay = new Openpay('mbipwocgkvgkndoykdgg', 'sk_252732b74920457099f62651857894ef', 'mx', false);

@Component({
  selector: 'app-cardform',
  templateUrl: './cardform.component.html',
  styleUrls: ['./cardform.component.scss']
})
export class CardComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  

  ngOnInit(): void {
    
  }


}
