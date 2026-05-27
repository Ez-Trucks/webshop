import { Component } from '@angular/core';
import { PartsApi } from '../../services/parts-api';
import { Part } from '../../models/part-model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  parts:Part[]=[];
  filteredParts:Part[]=[];
  loading = false;
  errorMessage = '';
  noticeMessage = '';

  //filtervelden
  selectedModel:string='';
  selectedCategory:string='';
  searchTerm:string='';
  minPrice:string='';
  maxPrice:string='';
  sortByPrice: ''|'asc'|'desc' ='';

  models=['XF','CF','LF','XG','XG+'];
  categories=['Motor','Versnellingsbak','Remmen','Cabine','Elektrisch','Overig'];

  constructor(private partsApi:PartsApi,private cartService:CartService){
    this.loadParts();
  }
  filterParts(){
    const min= this.minPrice ? Number(this.minPrice):0;
    const max = this.maxPrice ? Number(this.maxPrice):Number.MAX_VALUE;
    this.filteredParts=this.parts.filter(p=>{
      return (
        (this.selectedModel===''|| p.model===this.selectedModel)&&
        (this.selectedCategory===''|| p.category===this.selectedCategory)&&
        (this.searchTerm===''|| p.name.toLowerCase().includes(this.searchTerm.toLowerCase())|| p.partNumber.includes(this.searchTerm)) &&
        p.price >= min && p.price <= max
      );
    });
    this.applySorting();
  }
  applySorting(){
      if (this.sortByPrice === 'asc') {
      this.filteredParts = [...this.filteredParts].sort(
        (a, b) => a.price - b.price
      );
    } else if (this.sortByPrice === 'desc') {
      this.filteredParts = [...this.filteredParts].sort(
        (a, b) => b.price - a.price
      );
    }
  }
  addToCart(part:Part){
    this.cartService.addToCart(part,1)
    this.noticeMessage = `${part.name} werd toegevoegd aan je winkelmand.`;
  }
  loadParts() {
  this.loading = true;
  this.errorMessage = '';
  this.partsApi.getAll().subscribe({
    next: (data) => {
      this.parts = data;
      this.filteredParts = data;
      this.applySorting(); // optioneel
      this.loading = false;
    },
    error: (err) => {
      console.error('Fout bij laden onderdelen via API:', err);
      this.errorMessage = 'Onderdelen laden is mislukt. Probeer later opnieuw.';
      this.loading = false;
    },
  });
}

  
}

