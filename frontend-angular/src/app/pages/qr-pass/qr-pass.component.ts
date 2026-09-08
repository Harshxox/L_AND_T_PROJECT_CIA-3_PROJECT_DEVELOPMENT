import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MembershipService } from '../../core/services/membership.service';
import { Membership } from '../../core/models/membership.model';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-pass',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="text-center mb-2">
        <h1>DIGITAL MEMBER PASS</h1>
        <p class="text-iron">Present this dynamic QR code at the turnstile or front desk scanner.</p>
      </div>

      <div class="qr-pass-card">
        <div class="flex justify-between items-center mb-1">
          <span style="font-family: var(--font-display); font-size: 1.4rem; color: var(--chalk-yellow);">GYMLAND ACCESS</span>
          <span class="badge" [ngClass]="activeMembership ? 'badge-active' : 'badge-error'">
            {{ activeMembership ? 'ACTIVE MEMBER' : 'INACTIVE / EXPIRED' }}
          </span>
        </div>

        <p class="mono-data text-iron-muted" style="font-size: 0.85rem;">{{ auth.currentUser()?.email }}</p>
        <h2 style="font-size: 2rem; margin: 0.5rem 0;">{{ auth.currentUser()?.name }}</h2>

        <div class="qr-container">
          <canvas #qrCanvas></canvas>
        </div>

        <div class="mono-data" style="font-size: 0.85rem; color: var(--chalk-yellow); margin-bottom: 0.5rem;">
          TOKEN: {{ auth.currentUser()?.qrToken }}
        </div>

        <div class="flex justify-between items-center text-iron-muted mono-data" style="font-size: 0.85rem; border-top: 1px solid #333; padding-top: 1rem; margin-top: 1rem;">
          <span>EXPIRES: {{ activeMembership ? (activeMembership.endDate | date:'mediumDate') : 'NO ACTIVE PLAN' }}</span>
          <span>PT CREDITS: {{ auth.currentUser()?.ptSessionsBalance || 0 }}</span>
        </div>

        <button class="btn btn-outline mt-2 w-full" style="border-color: var(--stone); color: var(--stone);" (click)="refreshPass()">
          🔄 Refresh Security Pass
        </button>
      </div>
    </div>
  `,
  styles: [`
    .qr-pass-card {
      background: #11100F;
      color: var(--stone);
      border: 2px solid var(--chalk-yellow);
      border-radius: 4px;
      padding: 2.5rem 2rem;
      max-width: 440px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
    }
    .qr-container {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      display: inline-block;
      margin: 1.5rem auto;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
  `]
})
export class QrPassComponent implements OnInit {
  auth = inject(AuthService);
  private memService = inject(MembershipService);

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  activeMembership: Membership | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.auth.getMe().subscribe(() => {
      this.generateQR();
    });

    this.memService.getMyMemberships().subscribe({
      next: (res) => {
        const list = res.data?.memberships || [];
        this.activeMembership = list.find(m => m.status === 'ACTIVE') || null;
      }
    });
  }

  generateQR() {
    setTimeout(() => {
      if (this.qrCanvas && this.auth.currentUser()?.qrToken) {
        QRCode.toCanvas(this.qrCanvas.nativeElement, this.auth.currentUser()?.qrToken as string, {
          width: 190,
          margin: 1,
          color: {
            dark: '#1C1B1A',
            light: '#FFFFFF'
          }
        });
      }
    }, 100);
  }

  refreshPass() {
    this.auth.getMe().subscribe(() => {
      this.generateQR();
      alert('Security pass refreshed!');
    });
  }
}
