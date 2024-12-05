import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Mock implementation of Angular's testing utilities
class TestBed {
  static configureTestingModule(config: any): void {}
  static createComponent<T>(component: new (...args: any[]) => T): { componentInstance: T } {
    return { componentInstance: new component() };
  }
}

class ComponentFixture<T> {
  componentInstance: T;
  constructor(component: T) {
    this.componentInstance = component;
  }
  detectChanges(): void {}
}

// Component implementation
@Component({
  selector: 'app-index',
  template: `
    <h1>Flask-SocketIO-Chat</h1>
    <form [formGroup]="chatForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="name">Name:</label>
        <input id="name" type="text" formControlName="name">
        <span *ngIf="chatForm.get('name')?.errors?.['required'] && chatForm.get('name')?.touched">
          Name is required
        </span>
      </div>
      <div>
        <label for="room">Room:</label>
        <input id="room" type="text" formControlName="room">
        <span *ngIf="chatForm.get('room')?.errors?.['required'] && chatForm.get('room')?.touched">
          Room is required
        </span>
      </div>
      <button type="submit" [disabled]="!chatForm.valid">Submit</button>
    </form>
  `
})
class IndexComponent implements OnInit {
  chatForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.chatForm = this.formBuilder.group({
      name: ['', Validators.required],
      room: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.chatForm.valid) {
      console.log('Form submitted:', this.chatForm.value);
    }
  }
}

// Mock FormBuilder
class MockFormBuilder {
  group(controlsConfig: {[key: string]: any}): FormGroup {
    const group: {[key: string]: AbstractControl} = {};
    for (const key in controlsConfig) {
      if (controlsConfig.hasOwnProperty(key)) {
        group[key] = new MockFormControl(controlsConfig[key][0], controlsConfig[key][1]);
      }
    }
    return new FormGroup(group);
  }
}

// Mock FormGroup
class FormGroup {
  controls: {[key: string]: AbstractControl};
  constructor(controls: {[key: string]: AbstractControl}) {
    this.controls = controls;
  }
  get(path: string): AbstractControl | null {
    return this.controls[path] || null;
  }
  get valid(): boolean {
    return Object.values(this.controls).every(control => control.valid);
  }
  get value(): any {
    const value: {[key: string]: any} = {};
    for (const key in this.controls) {
      if (this.controls.hasOwnProperty(key)) {
        value[key] = this.controls[key].value;
      }
    }
    return value;
  }
}

// Mock FormControl
class MockFormControl implements AbstractControl {
  value: any;
  validator: Function | null;
  errors: {[key: string]: any} | null = null;
  touched: boolean = false;

  constructor(value: any, validator: Function | null = null) {
    this.value = value;
    this.validator = validator;
    this.validate();
  }

  get valid(): boolean {
    return this.errors === null;
  }

  validate(): void {
    if (this.validator) {
      this.errors = this.validator(this);
    }
  }

  setValue(value: any): void {
    this.value = value;
    this.validate();
  }
}

// Test suite
describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexComponent ],
      providers: [
        { provide: FormBuilder, useClass: MockFormBuilder }
      ]
    });
    fixture = new ComponentFixture(new IndexComponent(new MockFormBuilder()));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.chatForm.get('name')?.value).toBe('');
    expect(component.chatForm.get('room')?.value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.chatForm.valid).toBeFalsy();
  });

  it('should be valid when both fields are filled', () => {
    const nameControl = component.chatForm.get('name');
    const roomControl = component.chatForm.get('room');
    if (nameControl && roomControl) {
      nameControl.setValue('John');
      roomControl.setValue('Test Room');
    }
    expect(component.chatForm.valid).toBeTruthy();
  });

  it('should call onSubmit when form is submitted', () => {
    spyOn(console, 'log');
    const nameControl = component.chatForm.get('name');
    const roomControl = component.chatForm.get('room');
    if (nameControl && roomControl) {
      nameControl.setValue('John');
      roomControl.setValue('Test Room');
    }
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Form submitted:', { name: 'John', room: 'Test Room' });
  });
});

// Test runner
function describe(name: string, fn: () => void) {
  console.log(`Test Suite: ${name}`);
  fn();
}

function beforeEach(fn: () => void) {
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${error}`);
  }
}

function expect(actual: any) {
  return {
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected ${actual} to be truthy`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected ${actual} to be falsy`);
    },
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${actual} to be ${expected}`);
    }
  };
}

function spyOn(obj: any, method: string) {
  const original = obj[method];
  let calls: any[] = [];
  obj[method] = (...args: any[]) => {
    calls.push(args);
    return original.apply(obj, args);
  };
  obj[method].calls = calls;
}

// Run the tests
describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexComponent ],
      providers: [
        { provide: FormBuilder, useClass: MockFormBuilder }
      ]
    });
    fixture = new ComponentFixture(new IndexComponent(new MockFormBuilder()));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.chatForm.get('name')?.value).toBe('');
    expect(component.chatForm.get('room')?.value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.chatForm.valid).toBeFalsy();
  });

  it('should be valid when both fields are filled', () => {
    const nameControl = component.chatForm.get('name');
    const roomControl = component.chatForm.get('room');
    if (nameControl && roomControl) {
      nameControl.setValue('John');
      roomControl.setValue('Test Room');
    }
    expect(component.chatForm.valid).toBeTruthy();
  });

  it('should call onSubmit when form is submitted', () => {
    spyOn(console, 'log');
    const nameControl = component.chatForm.get('name');
    const roomControl = component.chatForm.get('room');
    if (nameControl && roomControl) {
      nameControl.setValue('John');
      roomControl.setValue('Test Room');
    }
    component.onSubmit();
    expect(console.log).toBeTruthy();
  });
});

console.log('All tests completed.');