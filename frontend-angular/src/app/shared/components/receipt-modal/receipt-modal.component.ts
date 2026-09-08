import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="receipt">
      <div class="modal-card">
        <div class="text-center mb-2">
          <span class="badge badge-active mb-1">PAYMENT SUCCESSFUL</span>
          <h2>OFFICIAL RECEIPT</h2>
          <p class="mono-data text-iron-muted">{{ receipt.receiptNumber }}</p>
        </div>

        <div class="card status-charcoal mb-2">
          <div class="flex justify-between items-center mb-1">
            <span class="mono-data text-iron">Billed To:</span>
            <span class="mono-data font-bold">{{ receipt.memberName }}</span>
          </div>
          <div class="flex justify-between items-center mb-1">
            <span class="mono-data text-iron">Item:</span>
            <span class="mono-data">{{ receipt.item }}</span>
          </div>
          <div class="flex justify-between items-center mb-1">
            <span class="mono-data text-iron">Payment Mode:</span>
            <span class="mono-data">{{ receipt.paymentMethod }}</span>
          </div>
          <div class="flex justify-between items-center mb-1">
            <span class="mono-data text-iron">Transaction ID:</span>
            <span class="mono-data" style="font-size: 0.8rem;">{{ receipt.transactionId }}</span>
          </div>
          <div class="flex justify-between items-center mt-2" style="border-top: 1px solid var(--iron); padding-top: 0.5rem;">
            <span class="mono-data font-bold">Total Paid:</span>
            <span class="mono-data font-bold text-chalk" style="font-size: 1.5rem;">\${{ receipt.finalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex gap-1">
          <button class="btn btn-outline" style="width: 50%;" (click)="printReceipt()">🖨️ Print Receipt</button>
          <button class="btn btn-primary" style="width: 50%;" (click)="close()">Done</button>
        </div>
      </div>
    </div>
  `
})
export class ReceiptModalComponent {
  @Input() receipt: Receipt | null = null;
  @Output() closeEvent = new EventEmitter<void>();

  printReceipt() {
    window.print();
  }

  close() {
    this.receipt = null;
    this.closeEvent.emit();
  }
}
