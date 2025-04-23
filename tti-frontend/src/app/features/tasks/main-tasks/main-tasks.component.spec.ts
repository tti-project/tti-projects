import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTasksComponent } from './main-tasks.component';

describe('MainTasksComponent', () => {
  let component: MainTasksComponent;
  let fixture: ComponentFixture<MainTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
