import { Component, ElementRef, HostListener, ViewChild, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PartsApi } from '../../services/parts-api';
import { Part, getPartImages, getPrimaryPartImage } from '../../models/part-model';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { LanguageService } from '../../services/language';
@Component({
  selector: 'app-product-detail',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnDestroy {
  @ViewChild('photoDialog') photoDialog?: ElementRef<HTMLDialogElement>;
  private document = inject(DOCUMENT);
  private previousOverflow: string | null = null;
  part?:Part;
  loading=true;
  selectedImage = '';
  
  constructor(
    private route:ActivatedRoute,
    private partsApi:PartsApi,
    private cartService:CartService,
    public languageService: LanguageService,

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
      if (this.part.stock <= 0) {
        alert('Deze vrachtwagen is momenteel niet beschikbaar.');
        return;
      }

      this.cartService.addToCart(this.part,1)
      alert("Je interesse werd bewaard. Neem contact op voor bezichtiging of meer info.")
    }
  }

  getImages(): string[] {
    return this.part ? getPartImages(this.part) : [];
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  get imageIndex(): number {
    return Math.max(0, this.getImages().indexOf(this.selectedImage));
  }

  moveImage(offset: number): void {
    const images = this.getImages();
    if (images.length) this.selectedImage = images[(this.imageIndex + offset + images.length) % images.length];
  }

  openPhoto(): void {
    const dialog = this.photoDialog?.nativeElement;
    if (!dialog || dialog.open) return;
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    dialog.showModal();
  }

  closePhoto(): void { this.photoDialog?.nativeElement.close(); }

  restoreScroll(): void {
    if (this.previousOverflow !== null) {
      this.document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = null;
    }
  }

  @HostListener('document:keydown', ['$event'])
  galleryKeydown(event: KeyboardEvent): void {
    if (!this.photoDialog?.nativeElement.open) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.moveImage(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  closeBackdrop(event: MouseEvent): void {
    if (event.target === this.photoDialog?.nativeElement) this.closePhoto();
  }

  ngOnDestroy(): void { this.restoreScroll(); }

  formatMileage(): string {
    return this.part?.mileage
      ? `${this.part.mileage.toLocaleString('nl-BE')} km`
      : this.languageService.t('onRequest');
  }

}

