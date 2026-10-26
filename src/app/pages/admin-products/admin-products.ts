import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PartsApi } from '../../services/parts-api';
import { Part, getPartImages, getPrimaryPartImage } from '../../models/part-model';
import { AdminAuth } from '../../services/admin-auth';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit {
  private api = inject(PartsApi);
  private fb = inject(FormBuilder);
  private auth = inject(AdminAuth);
  private router = inject(Router);

  parts: Part[] = [];

  models: string[] = ['DAF', 'Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'Iveco', 'Renault'];
  categories: string[] = [
    'Trekker',
    'Bakwagen',
    'Kipper',
    'Containerwagen',
    'Koelwagen',
    'Chassis cabine',
    'Oplegger',
  ];
  euroNorms: string[] = ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Onbekend'];
  axleConfigs: string[] = ['4x2', '6x2', '6x4', '8x2', '8x4', '4x4', '6x6'];
  fuelTypes: string[] = ['Diesel', 'Elektrisch', 'Hybride', 'CNG', 'LNG'];
  transmissions: string[] = ['Automaat', 'Manueel', 'Halfautomaat'];

  submitted = false;
  editingPartId: string | null = null;

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  imageProcessing = false;
  selectedImages: string[] = [];

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    partNumber: ['', [Validators.required]],
    model: ['', [Validators.required]],
    category: ['', [Validators.required]],
    condition: this.fb.nonNullable.control<'used' | 'new'>('used', {
      validators: [Validators.required],
    }),
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [1, [Validators.required, Validators.min(0)]],
    warehouseLocation: [''],
    image: [''],
    year: [new Date().getFullYear(), [Validators.min(1900)]],
    mileage: [0, [Validators.min(0)]],
    euroNorm: [''],
    axleConfig: [''],
    powerHp: [0, [Validators.min(0)]],
    fuel: ['Diesel'],
    transmission: ['Automaat'],
    description: [''],
  });

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (items) => {
          this.parts = items;
        },
        error: (err) => {
          console.error('GET /parts failed', err);
          if (err.status === 401) {
            this.logout();
            return;
          }
          this.errorMessage = 'Laden van vrachtwagens is mislukt.';
        },
      });
  }

  startEdit(part: Part): void {
    this.editingPartId = part.id;
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.productForm.setValue({
      name: part.name ?? '',
      partNumber: part.partNumber ?? '',
      model: part.model ?? '',
      category: part.category ?? '',
      condition: part.condition ?? 'used',
      price: Number(part.price ?? 0),
      stock: Number(part.stock ?? 0),
      warehouseLocation: part.warehouseLocation ?? '',
      image: '',
      year: Number(part.year ?? new Date().getFullYear()),
      mileage: Number(part.mileage ?? 0),
      euroNorm: part.euroNorm ?? '',
      axleConfig: part.axleConfig ?? '',
      powerHp: Number(part.powerHp ?? 0),
      fuel: part.fuel ?? 'Diesel',
      transmission: part.transmission ?? 'Automaat',
      description: part.description ?? '',
    });
    this.selectedImages = getPartImages(part);
  }

  cancelEdit(): void {
    this.editingPartId = null;
    this.submitted = false;
    this.errorMessage = '';

    this.productForm.reset({
      name: '',
      partNumber: '',
      model: '',
      category: '',
      condition: 'used',
      price: 0,
      stock: 1,
      warehouseLocation: '',
      image: '',
      year: new Date().getFullYear(),
      mileage: 0,
      euroNorm: '',
      axleConfig: '',
      powerHp: 0,
      fuel: 'Diesel',
      transmission: 'Automaat',
      description: '',
    });
    this.selectedImages = [];
  }

  getPrimaryImage(part: Part): string {
    return getPrimaryPartImage(part, 'images/ez-trucks-transparent-no-website.png?v=5');
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) {
      return;
    }

    this.errorMessage = '';

    if (files.some((file) => !file.type.startsWith('image/'))) {
      this.errorMessage = 'Kies een geldig afbeeldingsbestand.';
      input.value = '';
      return;
    }

    if (files.length + this.selectedImages.length > 30) {
      this.errorMessage = 'Je kunt maximaal 30 foto’s toevoegen.';
      input.value = '';
      return;
    }

    this.imageProcessing = true;

    Promise.all(files.map((file) => this.readAndResizeImage(file)))
      .then((images) => {
        this.selectedImages = [...this.selectedImages, ...images];
        input.value = '';
      })
      .catch(() => {
        this.errorMessage = 'Een of meerdere fotos konden niet verwerkt worden.';
        input.value = '';
      })
      .finally(() => {
        this.imageProcessing = false;
      });
  }

  removeImage(index: number): void {
    this.selectedImages = this.selectedImages.filter((_, imageIndex) => imageIndex !== index);
  }

  clearImages(): void {
    this.selectedImages = [];
  }

  private readAndResizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          resolve(this.resizeImage(image));
        };
        image.onerror = () => {
          reject(new Error('Image processing failed'));
        };
        image.src = String(reader.result);
      };
      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };
      reader.readAsDataURL(file);
    });
  }

  clearImage(): void {
    this.clearImages();
  }

  private resizeImage(image: HTMLImageElement): string {
    const maxSize = 900;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const canvas = document.createElement('canvas');

    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext('2d');
    context?.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.72);
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.productForm.invalid) {
      this.errorMessage = 'Controleer eerst de verplichte velden.';
      return;
    }

    this.saving = true;

    const formValue = this.productForm.getRawValue();
    const payload = {
      ...formValue,
      year: formValue.year || undefined,
      mileage: formValue.mileage || undefined,
      powerHp: formValue.powerHp || undefined,
      image: this.selectedImages.length > 0 ? JSON.stringify(this.selectedImages) : '',
    };
    const isEdit = !!this.editingPartId;

    const req$ = this.editingPartId
      ? this.api.update(this.editingPartId, payload)
      : this.api.create(payload);

    req$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.successMessage = isEdit
            ? 'Vrachtwagen succesvol aangepast.'
            : 'Vrachtwagen succesvol toegevoegd.';
          this.loadParts();
        },
        error: (err) => {
          console.error('Save failed', err);
          this.errorMessage = isEdit
            ? 'Opslaan van wijzigingen is mislukt.'
            : 'Toevoegen van vrachtwagen is mislukt.';
        },
      });
  }

  delete(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.api.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Vrachtwagen succesvol verwijderd.';
        this.loadParts();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.errorMessage = 'Verwijderen van vrachtwagen is mislukt.';
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}

