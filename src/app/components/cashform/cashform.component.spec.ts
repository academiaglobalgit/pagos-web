import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashComponent } from './cashform.component';

describe('HomeComponent', () => {
  let component: CashComponent;
  let fixture: ComponentFixture<CashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
