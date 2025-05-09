import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaFiscalComponent } from './nota-fiscal.component';

describe('NotaFiscalComponent', () => {
  let component: NotaFiscalComponent;
  let fixture: ComponentFixture<NotaFiscalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaFiscalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaFiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
