import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/cart-item-model';
import { Router,RouterLink } from '@angular/router';
import { ReactiveFormsModule,FormBuilder,Validators, FormGroup } from '@angular/forms';
import { OrderApi } from '../../services/order-api';
@Component({
  selector: 'app-checkout',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  items:CartItem[]=[];
  totalPrice=0;

  checkoutForm!:FormGroup;
  submitted=false;

  constructor(
    private fb:FormBuilder,
    private cartService:CartService,
    private router:Router,
    private orderApi:OrderApi
  ){
    this.items = this.cartService.getItems();
    this.totalPrice = this.cartService.getTotalPrice();
    this.checkoutForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    vatNumber: [''],
    street: ['', Validators.required],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    notes: [''],
  });
  }

  submitOrder() {
  this.submitted = true;

  if (this.checkoutForm.invalid || this.items.length === 0) {
    return;
  }

  const formValue = this.checkoutForm.getRawValue();

  const orderData = {
    customerName: formValue.name,
    email: formValue.email,
    phone: formValue.phone || '',
    address: formValue.street,
    city: formValue.city,
    postalCode: formValue.postalCode,
    country: formValue.country,
    totalPrice: this.totalPrice,
    items: this.items.map((item) => ({
      partId: item.part.id,
      name: item.part.name,
      price: item.part.price,
      quantity: item.quantity,
    })),
  };

  // 1. eerst order opslaan
  this.orderApi.create(orderData).subscribe({
    next: (createdOrder) => {

      // 2. payment starten
      this.orderApi.createPayment(createdOrder.id, createdOrder.totalPrice)
        .subscribe({
          next: (payment) => {
            // 3. redirect naar Mollie
            window.location.href = payment.checkoutUrl;
          },
          error: (err) => {
            console.error('Payment starten mislukt', err);
            alert('Betaling starten mislukt');
          }
        });

    },
    error: (err) => {
      console.error('Order opslaan mislukt', err);
      alert('Bestelling opslaan mislukt');
    },
  });
}


}

