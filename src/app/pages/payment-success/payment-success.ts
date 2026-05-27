import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderApi } from '../../services/order-api';
import { CartService } from '../../services/cart';
import { Order } from '../../models/order-model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.html',
})
export class PaymentSuccess implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = true;
  errorMessage = '';
  infoMessage = '';

  private retryCount = 0;
  private readonly maxRetries = 6;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderApi: OrderApi,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.cartService.clearCart();

    this.orderId = this.route.snapshot.queryParamMap.get('orderId');

    if (!this.orderId) {
      this.errorMessage = 'Geen ordernummer gevonden.';
      this.loading = false;
      return;
    }

    this.loadOrder();
  }

  ngOnDestroy(): void {
    this.clearRetryTimeout();
  }

  private clearRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  loadOrder(): void {
    if (!this.orderId) return;

    this.errorMessage = '';

    this.orderApi.getPublicSummary(this.orderId).subscribe({
      next: (order) => {
        this.order = order;

        if (order.status === 'paid') {
          this.clearRetryTimeout();
          this.loading = false;
          this.infoMessage = 'Je betaling werd succesvol bevestigd.';
          return;
        }

        if (order.status === 'pending') {
          if (this.retryCount < this.maxRetries) {
            this.loading = true;
            this.infoMessage = 'We controleren je betaling nog even...';
            this.retryCount++;

            this.clearRetryTimeout();
            this.retryTimeout = setTimeout(() => {
              this.loadOrder();
            }, 2000);

            return;
          }

          this.loading = false;
          this.infoMessage =
            'Je betaling wordt nog verwerkt. Vernieuw deze pagina binnen enkele seconden opnieuw.';
          return;
        }

        this.clearRetryTimeout();
        this.loading = false;
        this.infoMessage = `Je bestelling heeft momenteel status: ${order.status}.`;
      },
      error: (err) => {
        console.error('Order ophalen mislukt', err);
        this.clearRetryTimeout();
        this.errorMessage = 'Bestelling kon niet geladen worden.';
        this.loading = false;
      },
    });
  }
}
