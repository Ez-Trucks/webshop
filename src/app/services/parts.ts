import { Injectable } from '@angular/core';
import { Part } from '../models/part-model';

@Injectable({
  providedIn: 'root',
})
export class PartsService {
  private parts: Part[] = [
  {
    id: '1',
    name: 'DAF XF Euro 6 koplamp links',
    partNumber: '1934820',
    model: 'XF',
    category: 'cabine',
    condition: 'used',
    price: 250,
    image: 'https://www.trucksnl.be/img/9675d862fdec8b30ee98c59f6c753c8a/phare_piece_detachee_camion_daf_xf_cf_koplamp_links_1939777_euro_6_8295287.jpg?'
  },
  {
    id: '2',
    name: 'DAF CF Spiegels set',
    partNumber: '1652339',
    model: 'CF',
    category: 'cabine',
    condition: 'used',
    price: 180,
    image: 'https://www.trucksnl.be/img/f0d3f4d772245aa926eeefe310a4276d/spiegel_vrachtwagen_onderdeel_daf_1952141_buitenspiegel_cpl_li_cf_8233659.jpg?width=512&height=436&quality=70'
  },
  {
    id: '3',
    name: 'DAF LF remklauw',
    partNumber: '1456677',
    model: 'LF',
    category: 'remmen',
    condition: 'new',
    price: 320,
    image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQol00e5TcQoN9SjTcUJJp5jyROLgAQkLi8KxRCtf_z1oFQaTTUtUnR7TJ1DPUJdTMNrT6NufsvERtO5tJUm8VSpHk1jjNofOP_48aeb--l_mewuJdUWLLr'
  }
];


   constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('parts', JSON.stringify(this.parts));
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem('parts');
    if (data) {
      this.parts = JSON.parse(data);
    } else {
      // eerste keer: mock parts in localStorage bewaren
      this.saveToLocalStorage();
    }
  }

  getAllParts(): Part[] {
    return this.parts;
  }

  // ✅ nette oplopende ID's
  addPart(part: Omit<Part, 'id'>) {
    const lastId = this.parts.length
      ? Math.max(...this.parts.map(p => Number(p.id)))
      : 0;

    const newPart: Part = {
      ...part,
      id: String(lastId + 1),
    };

    this.parts.push(newPart);
    this.saveToLocalStorage();
  }
  updatePart(id: string, updated: Omit<Part, 'id'>) {
    const index = this.parts.findIndex(p => p.id === id);
    if (index === -1) return;

    this.parts[index] = {
      ...this.parts[index],
      ...updated,
      id, // veiligheid
    };

    this.saveToLocalStorage();
  }

  deletePart(id: string) {
    this.parts = this.parts.filter(p => p.id !== id);
    this.saveToLocalStorage();
  }

  
}

