import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      max-width: 300px;
      margin: 0 auto;
    }
    div {
      margin-bottom: 10px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 5px;
    }
    span {
      color: red;
      font-size: 0.8em;
    }
    button {
      margin-top: 10px;
      padding: 5px 10px;
    }
  `]
})
export class IndexComponent implements OnInit {
  chatForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.chatForm = this.formBuilder.group({
      name: ['', Validators.required],
      room: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialization logic can be added here if needed
  }

  onSubmit(): void {
    if (this.chatForm.valid) {
      console.log('Form submitted:', this.chatForm.value);
      // Add logic to handle form submission (e.g., navigate to chat room)
    }
  }
}