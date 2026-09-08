import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Receipt } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen">
      <div class="modal-card">
        <div class="flex justify-between items-center mb-2">
          <h2>DUMMY CHECKOUT (GATEWAY SIMULATOR)</h2>
          <button (click)="close()" style="background:none; border:none; font-size: 1.5rem; cursor:pointer;">&times;</button>
        </div>

        <div class="card status-warning mb-2">
          <h3>{{ item?.name }}</h3>
          <div class="flex justify-between items-center mt-1">
            <span class="mono-data text-iron">Original Price:</span>
            <span class="mono-data" style="font-size: 1.25rem;">\${{ item?.price?.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-moss" *ngIf="appliedDiscount > 0">
            <span class="mono-data">Discount ({{ appliedCouponCode }}):</span>
            <span class="mono-data">-\${{ appliedDiscount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center mt-1" style="border-top: 1px solid var(--iron); padding-top: 0.5rem;">
            <span class="mono-data font-bold">Total Due (Simulated):</span>
            <span class="mono-data font-bold text-chalk" style="font-size: 1.75rem;">\${{ finalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Coupon Code Form -->
        <div class="form-group flex gap-1 items-center">
          <input type="text" [(ngModel)]="couponInput" placeholder="Promo Code (e.g. WELCOME50, IRON20)" style="text-transform: uppercase;">
          <button class="btn btn-outline" type="button" (click)="applyCoupon()">Apply</button>
        </div>
        <div class="mono-data text-iron-muted mb-2" style="font-size: 0.8rem;">
          Try code: <strong>WELCOME50</strong> (50% OFF) or <strong>IRON20</strong> (20% OFF)
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label>Select Simulated Payment Mode</label>
          <select [(ngModel)]="paymentMethod">
            <option value="DUMMY_CARD">💳 Mock Credit / Debit Card</option>
            <option value="DUMMY_UPI">📱 Mock UPI / QR App (Instant)</option>
            <option value="DUMMY_NETBANKING">🏦 Mock NetBanking</option>
            <option value="CASH">💵 Cash at Front Desk</option>
          </select>
        </div>

        <!-- Mock Card Fields Preview -->
        <div *ngIf="paymentMethod === 'DUMMY_CARD'">
          <div class="form-group">
            <label>Card Number (Simulated)</label>
            <input type="text" value="4532 •••• •••• 8892" readonly style="color: var(--iron);">
          </div>
          <div class="grid gap-1" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label>Expiry</label>
              <input type="text" value="12/28" readonly style="color: var(--iron);">
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input type="text" value="789" readonly style="color: var(--iron);">
            </div>
          </div>
        </div>

        <button class="btn btn-primary mt-1 w-full" style="font-size: 1.1rem;" [disabled]="isProcessing" (click)="executeCheckout()">
          {{ isProcessing ? 'Processing simulated payment... ⏳' : 'Pay \$' + finalAmount.toFixed(2) + ' (Simulate Success)' }}
        </button>
      </div>
    </div>
  `
})
export class CheckoutModalComponent {
  @Input() isOpen = false;
  @Input() item: { type: 'PLAN' | 'PT'; planId?: string; count?: number; name: string; price: number } | null = null;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() checkoutSuccess = new EventEmitter<Receipt>();

  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);

  couponInput = '';
  appliedCouponCode = '';
  appliedDiscount = 0;
  paymentMethod = 'DUMMY_CARD';
  isProcessing = false;

  get finalAmount(): number {
    const orig = this.item?.price || 0;
    return Math.max(0, orig - this.appliedDiscount);
  }

  applyCoupon() {
    if (!this.couponInput || !this.item) return;
    this.paymentService.validateCoupon(this.couponInput, this.item.price).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.appliedCouponCode = res.data.couponCode;
          this.appliedDiscount = res.data.discountAmount;
        }
      },
      error: () => {
        alert('Invalid or expired coupon code. Try WELCOME50 or IRON20.');
      }
    });
  }

  executeCheckout() {
    if (!this.item) return;
    this.isProcessing = true;

    const payload: any = {
      paymentMethod: this.paymentMethod,
      couponCode: this.appliedCouponCode || undefined
    };

    if (this.item.type === 'PLAN') payload.planId = this.item.planId;
    if (this.item.type === 'PT') payload.ptPackageCount = this.item.count;

    this.paymentService.processCheckout(payload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.authService.getMe().subscribe();
        this.checkoutSuccess.emit(res.data.receipt);
        this.close();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Checkout failed');
      }
    });
  }

  close() {
    this.isOpen = false;
    this.appliedDiscount = 0;
    this.appliedCouponCode = '';
    this.couponInput = '';
    this.closeEvent.emit();
  }
}
