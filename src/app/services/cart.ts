import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item-model';
import { Part } from '../models/part-model';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'ez-trucks-cart';
  private items: CartItem[] = [];

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$=this.itemsSubject.asObservable();

  constructor() {
    this.items = this.loadStoredItems();
    this.notifyChanges();
  }

  private notifyChanges(){
    this.itemsSubject.next(this.items);
    this.storeItems();
  }

  private loadStoredItems(): CartItem[] {
    const rawItems = localStorage.getItem(this.storageKey);

    if (!rawItems) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(rawItems) as CartItem[];

      if (!Array.isArray(parsedItems)) {
        return [];
      }

      return parsedItems.filter((item) => item?.part?.id && item.quantity > 0);
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private storeItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  getItems(): CartItem[] {
    return this.items;
  }

  addToCart(part: Part, quantity: number = 1): void {
    const existing = this.items.find(i => i.part.id === part.id);
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = currentQuantity + quantity;

    if (nextQuantity > part.stock) {
      return;
    }

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
    if (quantity > item.part.stock) return;

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
    localStorage.removeItem(this.storageKey);
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

