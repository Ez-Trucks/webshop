import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';

type Language = 'nl' | 'en' | 'fr' | 'de';
interface Fact { key: string; value: string; source: string; certainty: string; confirmed: boolean; }
interface Attachment { name: string; mime: string; data: string; }
interface Draft {
  id: string; title: string; vin: string; notes: string; reference: string; price: number;
  photos: string[]; documents: Attachment[]; facts: Fact[]; texts: Record<Language, string>;
  warnings: string[]; status: string; revision: number; partId: string | null; updatedAt?: string;
}
interface Summary { id: string; title: string; vin: string; status: string; updatedAt: string; }
const blank = (): Draft => ({ id: '', title: '', vin: '', notes: '', reference: '', price: 0, photos: [], documents: [], facts: [],
  texts: { nl: '', en: '', fr: '', de: '' }, warnings: [], status: 'draft', revision: 1, partId: null });

@Component({ selector: 'app-admin-ad-assistant', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-ad-assistant.html', styleUrl: './admin-ad-assistant.css' })
export class AdminAdAssistant implements OnInit {
  private http = inject(HttpClient);
  private url = `${API_BASE_URL}/admin/ad-drafts`;
  draft = blank();
  items: Summary[] = [];
  busy = false; dirty = false; approved = false; deleteRequested = false;
  message = ''; error = ''; aiEnabled = false; capabilitiesLoaded = false;
  language: Language = 'nl';
  languages: Language[] = ['nl', 'en', 'fr', 'de'];
  fields = [ ['brand', 'Merk'], ['type', 'Model / uitvoering'], ['category', 'Voertuigtype'], ['year', 'Bouwjaar'],
    ['mileage', 'Kilometerstand (zonder punten)'], ['euroNorm', 'Euronorm'], ['axleConfig', 'Asconfiguratie'],
    ['powerHp', 'Vermogen (pk)'], ['fuel', 'Brandstof'], ['transmission', 'Versnellingsbak'],
    ['equipment', 'Uitrusting en opties'], ['damage', 'Schade en gebreken'], ['condition', 'Technische staat'] ];
  categories = ['Trekker', 'Bakwagen', 'Kipper', 'Containerwagen', 'Koelwagen', 'Chassis cabine', 'Oplegger', 'Bestelwagen', 'Aanhangwagen', 'Machine'];
  get published() { return this.draft.status === 'published'; }
  get confirmedCount() { return this.draft.facts.filter(f => f.value.trim() && f.confirmed).length; }
  get pendingCount() { return this.draft.facts.filter(f => f.value.trim() && !f.confirmed).length; }
  get hasTexts() { return !!this.draft.texts.nl.trim(); }
  get canPublish() {
    return this.draft.title.trim() && this.draft.price > 0 && this.draft.photos.length > 0 && this.hasTexts
      && ['brand', 'type', 'category'].every(key => this.draft.facts.some(f => f.key === key && f.value.trim() && f.confirmed));
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) { if (this.dirty) { event.preventDefault(); event.returnValue = ''; } }
  async ngOnInit() {
    await this.run(async () => {
      const cap = await firstValueFrom(this.http.get<{ aiEnabled: boolean }>(`${this.url}/capabilities`));
      this.aiEnabled = cap.aiEnabled; this.capabilitiesLoaded = true; await this.refresh();
    });
    this.fillFields();
  }
  private fillFields() {
    for (const [key] of this.fields) if (!this.draft.facts.some(f => f.key === key))
      this.draft.facts.push({ key, value: '', source: 'Handmatig ingevoerd', certainty: 'manual', confirmed: false });
    this.draft.facts.sort((a, b) => this.fields.findIndex(f => f[0] === a.key) - this.fields.findIndex(f => f[0] === b.key));
  }
  label(key: string) { return this.fields.find(f => f[0] === key)?.[1] ?? key; }
  certaintyLabel(value: string) { return ({ manual: 'Handmatig', document: 'Uit document', photo: 'Op foto gezien', inferred: 'Vermoeden' } as Record<string, string>)[value] || value; }
  private async refresh() { this.items = await firstValueFrom(this.http.get<Summary[]>(this.url)); }
  private accept(draft: Draft) { this.draft = draft; this.fillFields(); this.dirty = false; this.approved = false; this.deleteRequested = false; }
  mark(source = false) {
    this.dirty = true; this.approved = false; this.message = ''; this.deleteRequested = false;
    if (source) { this.draft.texts = { nl: '', en: '', fr: '', de: '' }; this.draft.status = 'draft'; }
  }
  editFact(fact: Fact) { fact.confirmed = false; fact.source = 'Handmatig aangepast'; fact.certainty = 'manual'; this.mark(true); }
  async newDraft() {
    if (this.dirty && !window.confirm('Je hebt niet-opgeslagen wijzigingen. Nieuw concept openen en deze wijzigingen verwijderen?')) return;
    this.accept(blank()); this.message = ''; this.error = '';
  }
  async open(id: string) {
    if (this.dirty && !window.confirm('Je hebt niet-opgeslagen wijzigingen. Ander concept openen en deze wijzigingen verwijderen?')) return;
    await this.run(async () => this.accept(await firstValueFrom(this.http.get<Draft>(`${this.url}/${id}`))));
  }
  private async persist() {
    if (this.published) return;
    this.draft.vin = this.draft.vin.toUpperCase().replace(/\s/g, '');
    if (this.draft.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(this.draft.vin)) throw new Error('Een VIN bestaat uit 17 tekens, zonder I, O of Q. Laat het leeg als je het nog niet kent.');
    const { title, vin, notes, photos, documents } = this.draft;
    if (!this.draft.id) {
      const created = await firstValueFrom(this.http.post<Draft>(this.url, { title, vin, notes, photos, documents }));
      this.draft.id = created.id; this.draft.revision = created.revision;
    }
    const saved = await firstValueFrom(this.http.patch<Draft>(`${this.url}/${this.draft.id}`, {
      title, vin, notes, photos, documents, reference: this.draft.reference, price: this.draft.price,
      revision: this.draft.revision, facts: this.draft.facts.filter(f => f.value.trim()), texts: this.draft.texts,
    }));
    this.accept(saved); await this.refresh();
  }
  async save() { await this.run(async () => { await this.persist(); this.message = 'Concept opgeslagen. Het staat nog niet op de website.'; }); }
  async analyze() {
    await this.run(async () => {
      await this.persist();
      this.accept(await firstValueFrom(this.http.post<Draft>(`${this.url}/${this.draft.id}/analyze`, { revision: this.draft.revision })));
      this.message = 'Analyse klaar. Controleer de bronnen en bevestig elk gegeven dat je wilt gebruiken.'; await this.refresh();
    });
  }
  async generate(ai: boolean) {
    await this.run(async () => {
      await this.persist();
      this.accept(await firstValueFrom(this.http.post<Draft>(`${this.url}/${this.draft.id}/${ai ? 'generate' : 'standard-texts'}`, { revision: this.draft.revision })));
      this.message = ai ? 'Advertentieteksten klaar. Lees elke taal na vóór gebruik.' : 'Standaardteksten klaar. De veldnamen zijn vertaald; controleer en vertaal zelf de ingevoerde waarden.';
      await this.refresh();
    });
  }
  async publish() {
    if (!this.approved || !this.canPublish) return;
    await this.run(async () => {
      const approved = this.approved;
      await this.persist();
      this.accept(await firstValueFrom(this.http.post<Draft>(`${this.url}/${this.draft.id}/publish`, { revision: this.draft.revision, approved })));
      this.message = 'Gepubliceerd op je website. Autoline is niet automatisch bijgewerkt.'; await this.refresh();
    });
  }
  async remove() {
    if (!this.draft.id) return;
    await this.run(async () => {
      await firstValueFrom(this.http.delete(`${this.url}/${this.draft.id}`, { body: { revision: this.draft.revision } }));
      this.accept(blank()); await this.refresh(); this.message = 'Concept verwijderd.';
    });
  }
  async photosSelected(event: Event) {
    const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []); input.value = '';
    await this.run(async () => {
      if (files.length + this.draft.photos.length > 8) throw new Error('Je kunt maximaal 8 voertuigfoto’s toevoegen.');
      if (files.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 15 * 1024 * 1024))
        throw new Error('Gebruik JPG, PNG of WebP van maximaal 15 MB per foto.');
      const photos = await Promise.all(files.map(async f => {
        const image = await createImageBitmap(f);
        const scale = Math.min(1200 / image.width, 1200 / image.height, 1); const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d'); if (!context) throw new Error('Foto kon niet verwerkt worden.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height); image.close();
        return canvas.toDataURL('image/jpeg', 0.8);
      }));
      this.draft.photos.push(...photos); this.mark(true);
    });
  }
  async documentsSelected(event: Event) {
    const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []); input.value = '';
    await this.run(async () => {
      if (files.length + this.draft.documents.length > 3) throw new Error('Voeg maximaal 3 bronbestanden toe.');
      const docs: Attachment[] = [];
      for (const file of files) {
        const mime = file.type || (file.name.toLowerCase().endsWith('.txt') ? 'text/plain' : '');
        if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'].includes(mime) || file.size > 5 * 1024 * 1024)
          throw new Error('Gebruik PDF, TXT, JPG, PNG of WebP van maximaal 5 MB per bronbestand.');
        const data = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error('Bestand kon niet gelezen worden.')); r.readAsDataURL(new Blob([file], { type: mime })); });
        docs.push({ name: file.name.slice(0, 150), mime, data });
      }
      this.draft.documents.push(...docs); this.mark(true);
    });
  }
  removePhoto(index: number) { this.draft.photos.splice(index, 1); this.mark(true); }
  movePhoto(index: number, offset: number) {
    const next = index + offset; if (next < 0 || next >= this.draft.photos.length) return;
    [this.draft.photos[index], this.draft.photos[next]] = [this.draft.photos[next], this.draft.photos[index]]; this.mark(true);
  }
  removeDocument(index: number) { this.draft.documents.splice(index, 1); this.mark(true); }
  async copy() {
    await this.run(async () => { await navigator.clipboard.writeText(`${this.draft.title}\n\n${this.draft.texts[this.language]}`); this.message = 'Advertentietekst gekopieerd.'; });
  }
  export() {
    const content = `${this.draft.title}\nReferentie: ${this.draft.reference || 'Nog niet ingevuld'}\nPrijs: € ${this.draft.price} excl. btw\n\n${this.draft.texts[this.language]}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `EZ-advertentie-${this.draft.reference.replace(/[^a-z0-9-]/gi, '') || 'concept'}-${this.language}.txt`; link.click(); URL.revokeObjectURL(url);
    this.message = 'Tekstbestand gedownload. Plak de tekst in Autoline en voeg daar de foto’s en voertuigvelden toe.';
  }
  async run(action: () => Promise<void>) {
    if (this.busy) return;
    this.busy = true; this.error = ''; this.message = '';
    try { await action(); } catch (err: any) {
      const message = err.error?.message;
      this.error = err.status === 401 ? 'Je sessie is verlopen. Log opnieuw in.' : Array.isArray(message) ? message.join(' · ') : message || err.message || 'De actie is mislukt. Probeer opnieuw.';
    } finally { this.busy = false; }
  }
}
