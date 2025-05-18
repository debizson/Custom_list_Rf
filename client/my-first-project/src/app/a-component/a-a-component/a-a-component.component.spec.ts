import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AAComponentComponent } from './a-a-component.component';

describe('AAComponentComponent', () => {
  let component: AAComponentComponent;
  let fixture: ComponentFixture<AAComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AAComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AAComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
