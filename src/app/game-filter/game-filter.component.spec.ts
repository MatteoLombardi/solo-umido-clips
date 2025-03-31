import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFilterComponent } from './game-filter.component';

describe('GameFilterComponent', () => {
  let component: GameFilterComponent;
  let fixture: ComponentFixture<GameFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
