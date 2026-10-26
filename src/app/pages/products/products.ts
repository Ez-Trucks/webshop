import { Component } from '@angular/core';
import { PartsApi } from '../../services/parts-api';
import { Part, getPrimaryPartImage } from '../../models/part-model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language';
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

  selectedBrand:string='';
  selectedType:string='';
  searchTerm:string='';
  minPrice:string='';
  maxPrice:string='';
  minYear:string='';
  maxMileage:string='';
  sortByPrice: ''|'asc'|'desc' ='';

  brands=['DAF','Volvo','Scania','Mercedes-Benz','MAN','Iveco','Renault'];
  types=['Trekker','Bakwagen','Kipper','Containerwagen','Koelwagen','Chassis cabine','Oplegger'];

  constructor(
    private partsApi:PartsApi,
    private cartService:CartService,
    public languageService: LanguageService,
  ){
    this.loadParts();
  }
  filterParts(){
    const min= this.minPrice ? Number(this.minPrice):0;
    const max = this.maxPrice ? Number(this.maxPrice):Number.MAX_VALUE;
    const minYear = this.minYear ? Number(this.minYear) : 0;
    const maxMileage = this.maxMileage ? Number(this.maxMileage) : Number.MAX_VALUE;
    const normalizedSearchTerm = this.searchTerm.toLowerCase();
    this.filteredParts=this.parts.filter(p=>{
      return (
        (this.selectedBrand===''|| p.model===this.selectedBrand)&&
        (this.selectedType===''|| p.category===this.selectedType)&&
        (this.searchTerm===''||
          p.name.toLowerCase().includes(normalizedSearchTerm)||
          p.partNumber.toLowerCase().includes(normalizedSearchTerm) ||
          (p.description ?? '').toLowerCase().includes(normalizedSearchTerm)) &&
        p.price >= min && p.price <= max &&
        (p.year ?? 0) >= minYear &&
        (p.mileage ?? 0) <= maxMileage
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
    if (part.stock <= 0) {
      this.noticeMessage = `${part.name} is momenteel niet beschikbaar.`;
      return;
    }

    this.cartService.addToCart(part,1)
    this.noticeMessage = `${part.name} werd bewaard als interesse. Neem contact op voor bezichtiging of meer info.`;
  }

  formatMileage(part: Part): string {
    return part.mileage ? `${part.mileage.toLocaleString('nl-BE')} km` : 'Kilometerstand op aanvraag';
  }

  getPrimaryImage(part: Part): string {
    return getPrimaryPartImage(part);
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
      console.error('Fout bij laden vrachtwagens via API:', err);
      this.errorMessage = 'Vrachtwagens laden is mislukt. Probeer later opnieuw.';
      this.loading = false;
    },
  });
}

  
}

