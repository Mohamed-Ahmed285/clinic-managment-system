import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelReasonModelComponent } from './cancel-reason-model.component';

describe('CancelReasonModelComponent', () => {
  let component: CancelReasonModelComponent;
  let fixture: ComponentFixture<CancelReasonModelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelReasonModelComponent]
    });
    fixture = TestBed.createComponent(CancelReasonModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
