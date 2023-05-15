import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferformComponent } from './transferform.component';

describe('HomeComponent', () => {
  let component: TransferformComponent;
  let fixture: ComponentFixture<TransferformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferformComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
