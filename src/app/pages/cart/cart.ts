import { Component } from '@angular/core';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/cart-item-model';
import { Part, getPrimaryPartImage } from '../../models/part-model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  items:CartItem[]=[];
  totalPrice:number=0;

  constructor(private cartservice: CartService){
    this.loadCart();
  }

  loadCart(){
    this.items = this.cartservice.getItems();
    this.totalPrice=this.cartservice.getTotalPrice();
  }

  increase(item: CartItem){
    this.cartservice.updateQuantity(item.part.id,item.quantity + 1);
    this.loadCart();
  }

  decrease(item:CartItem){
    this.cartservice.updateQuantity(item.part.id,item.quantity - 1);
    this.loadCart();
  }

  removeItem(partId:string){
    this.cartservice.removeFromCart(partId)
    this.loadCart();
  }
  
  clearCart(){
    this.cartservice.clearCart();
    this.loadCart();
  }

  getPrimaryImage(part: Part): string {
    return getPrimaryPartImage(part);
  }

}

