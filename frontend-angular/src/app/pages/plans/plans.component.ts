import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipService } from '../../core/services/membership.service';
import { AuthService } from '../../core/services/auth.service';
import { MembershipPlan } from '../../core/models/membership.model';
import { CheckoutModalComponent } from '../../shared/components/checkout-modal/checkout-modal.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal/receipt-modal.component';
import { Receipt } from '../../core/models/transaction.model';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, CheckoutModalComponent, ReceiptModalComponent],
  template: `
    <div class="container">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1>MEMBERSHIP PLANS & SHOP</h1>
          <p class="text-iron">Select a plan to experience our simulated dummy checkout.</p>
        </div>
        <span class="badge badge-warning">MOCK CHECKOUT ENABLED</span>
      </div>

      <div class="tab-bar">
        <button class="tab-btn" [class.active]="currentTab === 'memberships'" (click)="currentTab = 'memberships'">MEMBERSHIP PLANS</button>
        <button class="tab-btn" [class.active]="currentTab === 'pt'" (click)="currentTab = 'pt'">PERSONAL TRAINING PACKS</button>
      </div>

      <!-- Tab 1: Membership Plans -->
      <div *ngIf="currentTab === 'memberships'" class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        <div *ngFor="let p of plans" class="card status-warning">
          <span class="badge badge-warning mb-1">{{ p.durationMonths }} MONTHS</span>
          <h2>{{ p.name }}</h2>
          <p class="text-iron mb-2">{{ p.description || 'Full gym and class access' }}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="mono-data text-chalk" style="font-size: 2.2rem;">\${{ p.price }}</span>
            <span class="mono-data text-iron-muted">ONE-TIME CHARGE</span>
          </div>
          <button class="btn btn-primary w-full" (click)="openPlanCheckout(p)">
            💳 Buy with Dummy Gateway
          </button>
        </div>
      </div>

      <!-- Tab 2: PT Packages -->
      <div *ngIf="currentTab === 'pt'" class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        <div *ngFor="let pkg of ptPacks" class="card status-charcoal">
          <span class="badge badge-active mb-1">{{ pkg.count }} SESSIONS</span>
          <h2>{{ pkg.name }}</h2>
          <p class="text-iron mb-2">{{ pkg.desc }}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="mono-data text-chalk" style="font-size: 2.2rem;">\${{ pkg.price }}</span>
            <span class="mono-data text-iron-muted">\${{ pkg.price / pkg.count }}/session</span>
          </div>
          <button class="btn btn-primary w-full" (click)="openPTCheckout(pkg)">
            💳 Purchase PT Credits
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <app-checkout-modal
      [isOpen]="isCheckoutOpen"
      [item]="checkoutItem"
      (closeEvent)="isCheckoutOpen = false"
      (checkoutSuccess)="onSuccess($event)">
    </app-checkout-modal>

    <!-- Receipt Modal -->
    <app-receipt-modal
      [receipt]="currentReceipt"
      (closeEvent)="currentReceipt = null">
    </app-receipt-modal>
  `
})
export class PlansComponent implements OnInit {
  private memService = inject(MembershipService);
  private authService = inject(AuthService);

  currentTab: 'memberships' | 'pt' = 'memberships';
  plans: MembershipPlan[] = [];

  ptPacks = [
    { count: 5, name: '5x Personal Training Pack', price: 200, desc: 'Introductory 1-on-1 coaching block.' },
    { count: 10, name: '10x Personal Training Pack', price: 380, desc: 'Standard transformation routine with custom macros.' },
    { count: 20, name: '20x Elite Athlete Pack', price: 700, desc: 'Comprehensive coaching and programming.' }
  ];

  isCheckoutOpen = false;
  checkoutItem: any = null;
  currentReceipt: Receipt | null = null;

  ngOnInit() {
    this.memService.getPlans().subscribe({
      next: (res) => this.plans = res.data?.plans || []
    });
  }

  openPlanCheckout(plan: MembershipPlan) {
    this.checkoutItem = {
      type: 'PLAN',
      planId: plan._id,
      name: `${plan.name} Membership`,
      price: plan.price
    };
    this.isCheckoutOpen = true;
  }

  openPTCheckout(pkg: any) {
    this.checkoutItem = {
      type: 'PT',
      count: pkg.count,
      name: pkg.name,
      price: pkg.price
    };
    this.isCheckoutOpen = true;
  }

  onSuccess(receipt: Receipt) {
    this.currentReceipt = receipt;
    this.authService.getMe().subscribe();
  }
}
