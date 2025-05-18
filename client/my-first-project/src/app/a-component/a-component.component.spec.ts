import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AComponentComponent } from './a-component.component';

describe('AComponentComponent', () => {
  let component: AComponentComponent;
  let fixture: ComponentFixture<AComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
