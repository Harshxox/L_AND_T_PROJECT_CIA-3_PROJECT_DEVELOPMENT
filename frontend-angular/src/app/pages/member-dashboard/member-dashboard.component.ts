import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MembershipService } from '../../core/services/membership.service';
import { Membership } from '../../core/models/membership.model';
import { CheckoutModalComponent } from '../../shared/components/checkout-modal/checkout-modal.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal/receipt-modal.component';
import { Receipt } from '../../core/models/transaction.model';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CheckoutModalComponent, ReceiptModalComponent],
  template: `
    <div class="container">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1>MEMBER DASHBOARD</h1>
          <p class="text-iron">Track your active membership, PT sessions, and attendance records.</p>
        </div>
      </div>

      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        
        <!-- Active Membership Card -->
        <ng-container *ngIf="activeMembership">
          <div class="card status-active">
            <div class="flex justify-between items-center mb-1">
              <span class="badge badge-active">ACTIVE MEMBERSHIP</span>
              <button class="btn btn-sm btn-outline" (click)="openFreezeModal(activeMembership._id)">⏸️ Freeze/Pause</button>
            </div>
            <h2 style="font-size: 2rem;">{{ activeMembership.planId?.name || 'Standard' }} Plan</h2>
            <div class="flex justify-between mono-data text-iron mt-2">
              <span>Valid Until: {{ activeMembership.endDate | date:'mediumDate' }}</span>
              <span>Renewals: {{ activeMembership.renewalCount }}</span>
            </div>
          </div>
        </ng-container>

        <!-- Frozen Membership Card -->
        <ng-container *ngIf="!activeMembership && frozenMembership">
          <div class="card status-warning">
            <div class="flex justify-between items-center mb-1">
              <span class="badge badge-warning">MEMBERSHIP FROZEN</span>
              <button class="btn btn-sm btn-moss" (click)="unfreeze(frozenMembership._id)">▶️ Unfreeze Now</button>
            </div>
            <h2>{{ frozenMembership.planId?.name }} (Paused)</h2>
            <p class="text-iron">Frozen until: {{ frozenMembership.freezeEndDate | date:'mediumDate' }}</p>
          </div>
        </ng-container>

        <!-- No Active Membership -->
        <ng-container *ngIf="!activeMembership && !frozenMembership">
          <div class="card status-warning">
            <span class="badge badge-error mb-1">NO ACTIVE MEMBERSHIP</span>
            <h2>Get Started with GymLand</h2>
            <p class="text-iron mb-2">Select a plan to experience our simulated checkout.</p>
            <a routerLink="/plans" class="btn btn-primary">View Plans & Shop</a>
          </div>
        </ng-container>

        <!-- PT Sessions Balance -->
        <div class="card status-charcoal">
          <span class="badge badge-warning mb-1">PERSONAL TRAINING</span>
          <h2>1-on-1 PT Credits</h2>
          <div class="flex justify-between items-center mt-2">
            <span class="mono-data text-chalk" style="font-size: 3rem;">{{ auth.currentUser()?.ptSessionsBalance || 0 }}</span>
            <button class="btn btn-outline" (click)="buyPTPackage(5)">+ Buy 5 Sessions ($200)</button>
          </div>
          <p class="text-iron mt-1">Assigned Coach: <strong>{{ auth.currentUser()?.assignedTrainerId?.name || 'Unassigned' }}</strong></p>
        </div>

        <!-- Attendance / Visits -->
        <div class="card">
          <span class="badge badge-active mb-1">ATTENDANCE</span>
          <h2>Total Visits</h2>
          <p class="mono-data" style="font-size: 3rem;">12</p>
          <p class="text-iron">Status: Regular Attendee</p>
        </div>

        <!-- Quick Actions -->
        <div class="card" style="grid-column: 1 / -1;">
          <h2>Quick Actions</h2>
          <div class="flex gap-1 mt-1 flex-wrap">
            <a routerLink="/qr-pass" class="btn btn-outline">🪪 Show Digital QR Pass</a>
            <a routerLink="/progress" class="btn btn-outline">📈 Log Body Measurements</a>
            <a routerLink="/classes" class="btn btn-outline">📅 Book Class / PT</a>
          </div>
        </div>

      </div>
    </div>

    <!-- Dummy Checkout Modal -->
    <app-checkout-modal 
      [isOpen]="isCheckoutOpen" 
      [item]="checkoutItem"
      (closeEvent)="isCheckoutOpen = false"
      (checkoutSuccess)="onCheckoutSuccess($event)">
    </app-checkout-modal>

    <!-- Receipt Modal -->
    <app-receipt-modal
      [receipt]="currentReceipt"
      (closeEvent)="currentReceipt = null">
    </app-receipt-modal>
  `
})
export class MemberDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private memService = inject(MembershipService);

  activeMembership: Membership | null = null;
  frozenMembership: Membership | null = null;

  isCheckoutOpen = false;
  checkoutItem: any = null;
  currentReceipt: Receipt | null = null;

  ngOnInit() {
    this.loadMemberships();
  }

  loadMemberships() {
    this.memService.getMyMemberships().subscribe({
      next: (res) => {
        const list = res.data?.memberships || [];
        this.activeMembership = list.find(m => m.status === 'ACTIVE') || null;
        this.frozenMembership = list.find(m => m.status === 'FROZEN') || null;
      }
    });
  }

  buyPTPackage(count: number) {
    this.checkoutItem = {
      type: 'PT',
      count,
      name: `${count}x Personal Training Sessions`,
      price: count * 40
    };
    this.isCheckoutOpen = true;
  }

  openFreezeModal(membershipId: string) {
    const days = prompt("Enter freeze duration in days (e.g. 7, 14, 30):", "14");
    if (!days) return;
    this.memService.freezeMembership(membershipId, Number(days)).subscribe({
      next: () => {
        alert(`Membership frozen for ${days} days!`);
        this.loadMemberships();
      }
    });
  }

  unfreeze(membershipId: string) {
    this.memService.unfreezeMembership(membershipId).subscribe({
      next: () => {
        alert('Membership reactivated!');
        this.loadMemberships();
      }
    });
  }

  onCheckoutSuccess(receipt: Receipt) {
    this.currentReceipt = receipt;
    this.loadMemberships();
    this.auth.getMe().subscribe();
  }
}
