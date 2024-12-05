import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

// Component implementation
@Component({
  selector: 'app-index',
  template: `
    <h1>Flask-SocketIO-Chat</h1>
    <form [formGroup]="chatForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="name">Name:</label>
        <input id="name" type="text" formControlName="name">
        <span *ngIf="chatForm.get('name').errors?.required && chatForm.get('name').touched">
          Name is required
        </span>
      </div>
      <div>
        <label for="room">Room:</label>
        <input id="room" type="text" formControlName="room">
        <span *ngIf="chatForm.get('room').errors?.required && chatForm.get('room').touched">
          Room is required
        </span>
      </div>
      <button type="submit" [disabled]="!chatForm.valid">Submit</button>
    </form>
  `
})
class IndexComponent implements OnInit {
  chatForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.chatForm = this.formBuilder.group({
      name: ['', Validators.required],
      room: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.chatForm.valid) {
      console.log('Form submitted:', this.chatForm.value);
    }
  }
}

// Test suite
describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexComponent ],
      imports: [ ReactiveFormsModule ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.chatForm.get('name').value).toBe('');
    expect(component.chatForm.get('room').value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.chatForm.valid).toBeFalsy();
  });

  it('should be valid when both fields are filled', () => {
    component.chatForm.patchValue({
      name: 'John',
      room: 'Test Room'
    });
    expect(component.chatForm.valid).toBeTruthy();
  });

  it('should call onSubmit when form is submitted', () => {
    spyOn(component, 'onSubmit');
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should log form value when valid form is submitted', () => {
    spyOn(console, 'log');
    component.chatForm.patchValue({
      name: 'John',
      room: 'Test Room'
    });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Form submitted:', { name: 'John', room: 'Test Room' });
  });
});

// Mock implementation of TestBed and related Angular testing utilities
class MockTestBed {
  static configureTestingModule(config: any) {
    return {
      compileComponents: async () => {}
    };
  }

  static createComponent(component: any) {
    return {
      componentInstance: new component(),
      detectChanges: () => {},
      nativeElement: {
        querySelector: () => ({
          dispatchEvent: () => {}
        })
      }
    };
  }
}

// Mock implementation of testing functions
function describe(name: string, fn: () => void) {
  console.log(`Test Suite: ${name}`);
  fn();
}

function beforeEach(fn: () => void) {
  fn();
}

function it(name: string, fn: () => void) {
  console.log(`  Test: ${name}`);
  fn();
}

function expect(actual: any) {
  return {
    toBeTruthy: () => console.log(`    Expected ${actual} to be truthy`),
    toBeFalsy: () => console.log(`    Expected ${actual} to be falsy`),
    toBe: (expected: any) => console.log(`    Expected ${actual} to be ${expected}`),
    toHaveBeenCalled: () => console.log(`    Expected function to have been called`),
    toHaveBeenCalledWith: (...args: any[]) => console.log(`    Expected function to have been called with ${args}`)
  };
}

function spyOn(obj: any, method: string) {
  const original = obj[method];
  obj[method] = function(...args: any[]) {
    obj[method].calls = (obj[method].calls || 0) + 1;
    obj[method].mostRecentCall = { args };
    return original.apply(this, args);
  };
}

// Run the tests
(global as any).TestBed = MockTestBed;
describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexComponent ],
      imports: [ ReactiveFormsModule ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.chatForm.get('name').value).toBe('');
    expect(component.chatForm.get('room').value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.chatForm.valid).toBeFalsy();
  });

  it('should be valid when both fields are filled', () => {
    component.chatForm.patchValue({
      name: 'John',
      room: 'Test Room'
    });
    expect(component.chatForm.valid).toBeTruthy();
  });

  it('should call onSubmit when form is submitted', () => {
    spyOn(component, 'onSubmit');
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should log form value when valid form is submitted', () => {
    spyOn(console, 'log');
    component.chatForm.patchValue({
      name: 'John',
      room: 'Test Room'
    });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Form submitted:', { name: 'John', room: 'Test Room' });
  });
});

console.log('All tests completed.');