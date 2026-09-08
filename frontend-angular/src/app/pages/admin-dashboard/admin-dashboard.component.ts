import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { AdminService } from '../../core/services/admin.service';
import { TrainerService } from '../../core/services/trainer.service';
import { ClassService } from '../../core/services/class.service';
import { User } from '../../core/models/user.model';
import { Trainer } from '../../core/models/trainer.model';
import { Equipment } from '../../core/models/equipment.model';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1>ADMIN OPERATIONS & FINANCIAL LEDGER</h1>
          <p class="text-iron">Financial analytics, equipment inventory, user management, and turnstile verification.</p>
        </div>
        <button class="btn btn-primary" (click)="isQRScannerOpen = true">📷 Front Desk QR Scanner</button>
      </div>

      <div class="tab-bar">
        <button class="tab-btn" [class.active]="currentTab === 'revenue'" (click)="currentTab = 'revenue'">FINANCIAL LEDGER</button>
        <button class="tab-btn" [class.active]="currentTab === 'users'" (click)="currentTab = 'users'">USER & TRAINER CRM</button>
        <button class="tab-btn" [class.active]="currentTab === 'equipment'" (click)="currentTab = 'equipment'">EQUIPMENT & MAINTENANCE</button>
        <button class="tab-btn" [class.active]="currentTab === 'classes'" (click)="currentTab = 'classes'">CLASS CREATOR</button>
      </div>

      <!-- TAB 1: Revenue -->
      <div *ngIf="currentTab === 'revenue'">
        <div class="grid gap-2 mb-2" style="grid-template-columns: repeat(3, 1fr);">
          <div class="card status-charcoal">
            <span class="badge badge-warning mb-1">SIMULATED REVENUE</span>
            <h2>\${{ ledgerData?.totalRevenue || 0 }}</h2>
            <p class="text-iron">Total payments processed</p>
          </div>
          <div class="card status-active">
            <span class="badge badge-active mb-1">TOTAL SALES</span>
            <h2>{{ ledgerData?.transactionCount || 0 }} Txns</h2>
            <p class="text-iron">Completed checkouts</p>
          </div>
          <div class="card status-warning">
            <span class="badge badge-warning mb-1">COUPON DISCOUNTS</span>
            <h2>\${{ ledgerData?.totalDiscounts || 0 }}</h2>
            <p class="text-iron">Promotional value granted</p>
          </div>
        </div>

        <div class="card">
          <h2>Financial Transaction Ledger</h2>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>RECEIPT / TXN ID</th>
                  <th>MEMBER</th>
                  <th>ITEM</th>
                  <th>PAID (SIMULATED)</th>
                  <th>MODE</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of ledgerData?.transactions">
                  <td class="mono-data font-bold">
                    {{ t.receiptNumber }}<br>
                    <span class="text-iron" style="font-size:0.75rem;">{{ t.transactionId }}</span>
                  </td>
                  <td>
                    {{ t.memberId?.name || 'Unknown' }}<br>
                    <span class="text-iron" style="font-size:0.8rem;">{{ t.memberId?.email || '' }}</span>
                  </td>
                  <td>{{ t.itemName }}</td>
                  <td class="mono-data font-bold text-moss">\${{ t.finalAmount }}</td>
                  <td><span class="badge badge-active">{{ t.paymentMethod }}</span></td>
                  <td class="mono-data text-iron">{{ t.createdAt | date:'short' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: User CRM -->
      <div *ngIf="currentTab === 'users'" class="card">
        <h2>User & Member CRM Directory</h2>
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL / PHONE</th>
                <th>ROLE</th>
                <th>ASSIGNED TRAINER</th>
                <th>PT CREDITS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="font-bold">{{ u.name }}</td>
                <td class="mono-data">{{ u.email }}<br><span class="text-iron">{{ u.phone || '--' }}</span></td>
                <td>
                  <span class="badge" [ngClass]="u.role === 'BRANCH ADMIN' ? 'badge-error' : (u.role === 'TRAINER' ? 'badge-warning' : 'badge-active')">
                    {{ u.role }}
                  </span>
                </td>
                <td>
                  <select (change)="assignTrainer(u._id, $event)" style="padding: 0.35rem; font-size: 0.85rem;">
                    <option value="">-- None --</option>
                    <option *ngFor="let tr of trainers" [value]="tr._id" [selected]="u.assignedTrainerId?._id === tr._id">
                      {{ tr.name }}
                    </option>
                  </select>
                </td>
                <td class="mono-data font-bold">{{ u.ptSessionsBalance || 0 }}</td>
                <td>
                  <button class="btn btn-sm btn-outline" *ngIf="u.role !== 'BRANCH ADMIN'" (click)="toggleRole(u._id, u.role)">
                    Make {{ u.role === 'MEMBER' ? 'TRAINER' : 'MEMBER' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: Equipment & Maintenance -->
      <div *ngIf="currentTab === 'equipment'">
        <div class="card status-warning mb-2">
          <h2>Add Gym Equipment / Machine</h2>
          <form (ngSubmit)="addEquipment()" class="grid gap-1 mt-1" style="grid-template-columns: 2fr 1fr 1fr 1fr auto;">
            <input type="text" [(ngModel)]="newEqName" name="eqName" placeholder="Machine Name" required>
            <input type="text" [(ngModel)]="newEqSerial" name="eqSerial" placeholder="Serial Number" required>
            <select [(ngModel)]="newEqCategory" name="eqCat">
              <option value="MACHINES">Machines</option>
              <option value="CARDIO">Cardio</option>
              <option value="FREE_WEIGHTS">Free Weights</option>
              <option value="CROSSFIT">CrossFit</option>
            </select>
            <select [(ngModel)]="newEqStatus" name="eqStatus">
              <option value="OPERATIONAL">Operational</option>
              <option value="MAINTENANCE_REQUIRED">Needs Servicing</option>
              <option value="OUT_OF_ORDER">Out of Order</option>
            </select>
            <button type="submit" class="btn btn-primary">+ Add Machine</button>
          </form>
        </div>

        <div class="card">
          <h2>Equipment Inventory & Maintenance Log</h2>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>SERIAL NO.</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let eq of equipment">
                  <td class="font-bold">{{ eq.name }}</td>
                  <td class="mono-data text-iron">{{ eq.serialNumber }}</td>
                  <td><span class="badge badge-active">{{ eq.category }}</span></td>
                  <td>
                    <select (change)="updateEquipmentStatus(eq._id, $event)" style="padding: 0.35rem; font-size: 0.85rem;">
                      <option value="OPERATIONAL" [selected]="eq.status === 'OPERATIONAL'">🟢 Operational</option>
                      <option value="MAINTENANCE_REQUIRED" [selected]="eq.status === 'MAINTENANCE_REQUIRED'">🟡 Needs Servicing</option>
                      <option value="OUT_OF_ORDER" [selected]="eq.status === 'OUT_OF_ORDER'">🔴 Out of Order</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-danger" (click)="deleteEquipment(eq._id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: Class Creator -->
      <div *ngIf="currentTab === 'classes'" class="card status-warning">
        <h2>Create New Class Slot</h2>
        <form (ngSubmit)="createClass()" class="mt-1">
          <div class="grid gap-1" style="grid-template-columns: 2fr 1fr 1fr;">
            <div class="form-group">
              <label>Class Title*</label>
              <input type="text" [(ngModel)]="newClassTitle" name="title" required placeholder="Morning Strength HIIT">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="newClassCategory" name="cat">
                <option value="STRENGTH">Strength</option>
                <option value="HIIT">HIIT</option>
                <option value="YOGA">Yoga</option>
                <option value="SPINNING">Spinning</option>
                <option value="CROSSFIT">CrossFit</option>
                <option value="BOXING">Boxing</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assigned Coach*</label>
              <select [(ngModel)]="newClassTrainerId" name="trainer" required>
                <option *ngFor="let tr of trainers" [value]="tr._id">{{ tr.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid gap-1" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
            <div class="form-group">
              <label>Date*</label>
              <input type="date" [(ngModel)]="newClassDate" name="date" required>
            </div>
            <div class="form-group">
              <label>Start Time* (HH:mm)</label>
              <input type="text" [(ngModel)]="newClassStartTime" name="start" value="08:00" required>
            </div>
            <div class="form-group">
              <label>End Time* (HH:mm)</label>
              <input type="text" [(ngModel)]="newClassEndTime" name="end" value="09:00" required>
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" [(ngModel)]="newClassCapacity" name="cap" value="20" required>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full">Publish Class Slot</button>
        </form>
      </div>

    </div>

    <!-- Front Desk QR Scanner Simulator Modal -->
    <div class="modal-overlay" *ngIf="isQRScannerOpen">
      <div class="modal-card">
        <div class="flex justify-between items-center mb-2">
          <h2>FRONT DESK TURNSTILE & QR SCANNER</h2>
          <button (click)="isQRScannerOpen = false" style="background:none; border:none; font-size: 1.5rem; cursor:pointer;">&times;</button>
        </div>
        <p class="text-iron mb-2">Simulate scanning a member's dynamic QR token to verify active access.</p>

        <div class="form-group flex gap-1">
          <input type="text" [(ngModel)]="scanTokenInput" placeholder="Paste or type member QR Token hex string...">
          <button class="btn btn-primary" (click)="verifyQR()">Verify & Check In</button>
        </div>

        <div *ngIf="scanResult" class="card mt-2" [ngClass]="scanResult.success ? 'status-active' : 'status-error'">
          <span class="badge" [ngClass]="scanResult.success ? 'badge-active' : 'badge-error'">
            {{ scanResult.success ? '🟢 ACCESS GRANTED' : '🔴 ACCESS DENIED' }}
          </span>
          <h2 class="mt-1">{{ scanResult.name || 'Invalid Pass' }}</h2>
          <p class="mono-data text-iron">{{ scanResult.message }}</p>
          <p class="mono-data text-chalk mt-1" *ngIf="scanResult.ptCredits !== undefined">PT Balance: {{ scanResult.ptCredits }} Credits</p>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private adminService = inject(AdminService);
  private trainerService = inject(TrainerService);
  private classService = inject(ClassService);

  currentTab: 'revenue' | 'users' | 'equipment' | 'classes' = 'revenue';
  ledgerData: any = null;
  users: User[] = [];
  trainers: Trainer[] = [];
  equipment: Equipment[] = [];

  // New Equipment Form
  newEqName = '';
  newEqSerial = '';
  newEqCategory: any = 'MACHINES';
  newEqStatus: any = 'OPERATIONAL';

  // New Class Form
  newClassTitle = '';
  newClassCategory: any = 'STRENGTH';
  newClassTrainerId = '';
  newClassDate = new Date().toISOString().split('T')[0];
  newClassStartTime = '08:00';
  newClassEndTime = '09:00';
  newClassCapacity = 20;

  // Scanner Modal
  isQRScannerOpen = false;
  scanTokenInput = '';
  scanResult: any = null;

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.paymentService.getAdminLedger().subscribe({
      next: (res) => this.ledgerData = res.data
    });

    this.adminService.getUsers().subscribe({
      next: (res) => this.users = res.data?.users || []
    });

    this.trainerService.getAllTrainers().subscribe({
      next: (res) => {
        this.trainers = res.data?.trainers || [];
        if (this.trainers.length > 0) this.newClassTrainerId = this.trainers[0]._id;
      }
    });

    this.adminService.getEquipment().subscribe({
      next: (res) => this.equipment = res.data?.equipment || []
    });
  }

  toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'MEMBER' ? 'TRAINER' : 'MEMBER';
    this.adminService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        alert(`Role updated to ${newRole}`);
        this.loadAll();
      }
    });
  }

  assignTrainer(userId: string, event: any) {
    const trainerId = event.target.value;
    this.adminService.assignTrainer(userId, trainerId).subscribe({
      next: () => alert('Trainer assigned successfully!')
    });
  }

  addEquipment() {
    if (!this.newEqName || !this.newEqSerial) return;
    this.adminService.addEquipment({
      name: this.newEqName,
      serialNumber: this.newEqSerial,
      category: this.newEqCategory,
      status: this.newEqStatus
    }).subscribe({
      next: () => {
        alert('Equipment added to inventory!');
        this.newEqName = '';
        this.newEqSerial = '';
        this.loadAll();
      }
    });
  }

  updateEquipmentStatus(id: string, event: any) {
    this.adminService.updateEquipment(id, { status: event.target.value }).subscribe({
      next: () => alert('Status updated!')
    });
  }

  deleteEquipment(id: string) {
    if (!confirm('Delete this machine?')) return;
    this.adminService.deleteEquipment(id).subscribe({
      next: () => this.loadAll()
    });
  }

  createClass() {
    if (!this.newClassTitle || !this.newClassTrainerId) return;
    this.classService.createClass({
      title: this.newClassTitle,
      category: this.newClassCategory,
      trainerId: this.newClassTrainerId,
      date: this.newClassDate,
      startTime: this.newClassStartTime,
      endTime: this.newClassEndTime,
      capacity: Number(this.newClassCapacity)
    }).subscribe({
      next: () => {
        alert('Class slot created successfully!');
        this.newClassTitle = '';
      }
    });
  }

  verifyQR() {
    if (!this.scanTokenInput) return;
    this.adminService.scanQRToken(this.scanTokenInput.trim()).subscribe({
      next: (res) => {
        const m = res.data?.member;
        this.scanResult = {
          success: true,
          name: m.name,
          message: `Access Granted! Plan: ${m.planName || 'Active Membership'}`,
          ptCredits: m.ptSessionsBalance
        };
      },
      error: (err) => {
        this.scanResult = {
          success: false,
          name: 'Access Denied',
          message: err.error?.message || 'Invalid or expired token.'
        };
      }
    });
  }
}
