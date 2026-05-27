import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item-model';
import { Part } from '../models/part-model';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$=this.itemsSubject.asObservable();

  private notifyChanges(){
    this.itemsSubject.next(this.items)
  }

  getItems(): CartItem[] {
    return this.items;
  }

  addToCart(part: Part, quantity: number = 1): void {
    const existing = this.items.find(i => i.part.id === part.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ part, quantity });
    }
    this.notifyChanges();
  }
  updateQuantity(partId:string,quantity:number):void{
    const item=this.items.find(i=> i.part.id === partId);
    if (!item) return;
    if (quantity <= 0 ){
      this.removeFromCart(partId);
      return;
    }
    item.quantity=quantity;
    this.notifyChanges();
  }

  removeFromCart(partId: string): void {
    this.items = this.items.filter(i => i.part.id !== partId);
    this.notifyChanges();
  }

  clearCart(): void {
    this.items = [];
    this.notifyChanges();
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (total, item) => total + item.part.price * item.quantity,
      0
    );
  }
  getTotalQuantity():number{
    return this.items.reduce((total,item)=> total + item.quantity,0);

  }

  
}

