import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PartsApi } from '../../services/parts-api';
import { Part, getPartImages, getPrimaryPartImage } from '../../models/part-model';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
@Component({
  selector: 'app-product-detail',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  part?:Part;
  loading=true;
  selectedImage = '';
  
  constructor(
    private route:ActivatedRoute,
    private partsApi:PartsApi,
    private cartService:CartService

  ){
    const id =this.route.snapshot.paramMap.get('id');
    if (id){
      if (id) {
      this.partsApi.getOne(id).subscribe({
        next: (data) => {
          this.part = data;
          this.selectedImage = getPrimaryPartImage(data);
          this.loading = false;
        },
        error: (err) => {
          console.error('Onderdeel niet gevonden / API fout:', err);
          this.part = undefined;
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
    }
  }
  addToCart(){
    if (this.part){
      this.cartService.addToCart(this.part,1)
      alert("Onderdeel toegevoegd aan het winkelmandje")
    }
  }

  getImages(): string[] {
    return this.part ? getPartImages(this.part) : [];
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

}

