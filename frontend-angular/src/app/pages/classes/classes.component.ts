import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../core/services/class.service';
import { AuthService } from '../../core/services/auth.service';
import { GymClass } from '../../core/models/class.model';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1>CLASS SCHEDULE & BOOKINGS</h1>
          <p class="text-iron">Discover group workouts and reserve your spot.</p>
        </div>
        <div class="flex gap-1">
          <select [(ngModel)]="selectedCategory" (change)="filterClasses()" style="width: 170px;">
            <option value="ALL">All Categories</option>
            <option value="STRENGTH">Strength</option>
            <option value="HIIT">HIIT</option>
            <option value="YOGA">Yoga</option>
            <option value="SPINNING">Spinning</option>
            <option value="CROSSFIT">CrossFit</option>
            <option value="BOXING">Boxing</option>
          </select>
          <button class="btn btn-outline" (click)="loadClasses()">Refresh</button>
        </div>
      </div>

      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));">
        <div *ngFor="let c of filteredClasses" class="class-card card p-0 overflow-hidden" [ngClass]="c.bookedCount >= c.capacity ? 'status-error' : 'status-active'">
          <!-- Class Hero Image Preview -->
          <div class="class-media-header" [style.backgroundImage]="'linear-gradient(to bottom, rgba(28,27,26,0.3), rgba(28,27,26,0.9)), url(' + getCategoryImage(c.category) + ')'">
            <span class="badge" [ngClass]="c.bookedCount >= c.capacity ? 'badge-error' : 'badge-active'">{{ c.category || 'GENERAL' }}</span>
            <span class="badge badge-warning">{{ c.room || 'Studio 1' }}</span>
          </div>

          <div class="p-2">
            <h2>{{ c.title }}</h2>
            <p class="mono-data text-iron mb-1">📅 {{ c.date | date:'mediumDate' }} // ⏰ {{ c.startTime }} - {{ c.endTime }}</p>
            <p class="text-iron mb-2" style="font-size: 0.9rem;">Instructor: <strong>{{ c.instructorName || 'Master Coach' }}</strong></p>

            <div class="flex justify-between items-center mb-1">
              <span class="mono-data" style="font-size: 0.85rem;">CAPACITY</span>
              <span class="mono-data" [class.text-rust]="c.bookedCount >= c.capacity">{{ c.bookedCount }} / {{ c.capacity }}</span>
            </div>

            <!-- Capacity Bar -->
            <div style="width: 100%; height: 8px; background: var(--iron); border-radius: 2px; overflow: hidden; margin-bottom: 1.25rem;">
              <div [style.width.%]="(c.bookedCount / c.capacity) * 100" style="height: 100%; background: var(--charcoal); transition: width 0.4s;"></div>
            </div>

            <div class="flex justify-between items-center">
              <button *ngIf="auth.userRole() === 'MEMBER'" class="btn" [ngClass]="c.bookedCount >= c.capacity ? 'btn-outline' : 'btn-primary'" (click)="bookClass(c._id)">
                {{ c.bookedCount >= c.capacity ? 'Join Waitlist' : 'Book Spot' }}
              </button>
              <button class="btn btn-sm btn-outline" (click)="openReview(c._id)">⭐ Rate Class</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .class-media-header {
      height: 160px;
      background-size: cover;
      background-position: center;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem;
      border-bottom: 2px solid var(--charcoal);
    }
  `]
})
export class ClassesComponent implements OnInit {
  private classService = inject(ClassService);
  auth = inject(AuthService);

  classes: GymClass[] = [];
  filteredClasses: GymClass[] = [];
  selectedCategory = 'ALL';

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data?.classes || [];
        this.filterClasses();
      }
    });
  }

  getCategoryImage(category: string): string {
    const cat = (category || '').toUpperCase();
    if (cat === 'STRENGTH' || cat === 'CROSSFIT') return '/images/strength.jpg';
    if (cat === 'HIIT' || cat === 'BOXING' || cat === 'SPINNING') return '/images/hiit.jpg';
    if (cat === 'YOGA') return '/images/yoga.jpg';
    return '/images/hero.jpg';
  }

  filterClasses() {
    if (this.selectedCategory === 'ALL') {
      this.filteredClasses = this.classes;
    } else {
      this.filteredClasses = this.classes.filter(c => c.category === this.selectedCategory);
    }
  }

  bookClass(classId: string) {
    this.classService.bookClass(classId).subscribe({
      next: () => {
        alert('Class booked or added to waitlist successfully!');
        this.loadClasses();
      },
      error: (err) => {
        alert(err.error?.message || 'Booking failed. Ensure you have an active membership.');
      }
    });
  }

  openReview(classId: string) {
    const rating = prompt('Enter star rating (1-5):', '5');
    if (!rating) return;
    const comment = prompt('Enter your review comment:', 'Awesome workout session!');
    if (!comment) return;

    this.classService.submitReview({
      targetType: 'CLASS',
      classId,
      rating: Number(rating),
      comment
    }).subscribe({
      next: () => alert('Thank you! Review submitted.')
    });
  }
}
