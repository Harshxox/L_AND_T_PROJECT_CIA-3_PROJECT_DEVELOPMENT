import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../core/services/trainer.service';
import { User } from '../../core/models/user.model';
import { Trainer } from '../../core/models/trainer.model';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="trainer-header-card mb-2 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <img src="/images/trainer.jpg" alt="Coach Marcus" class="trainer-avatar">
          <div>
            <div class="flex items-center gap-1 mb-1">
              <span class="badge badge-warning">SENIOR HEAD COACH</span>
              <span class="badge badge-active">Active Roster</span>
            </div>
            <h1>COACH MARCUS</h1>
            <p class="text-iron" style="font-size: 0.95rem;">Strength & Conditioning Specialist // Hypertrophy & Kinetic Rehabilitation</p>
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-outline" (click)="loadClients()">Refresh Data</button>
        </div>
      </div>

      <div class="tab-bar">
        <button class="tab-btn" [class.active]="currentTab === 'clients'" (click)="currentTab = 'clients'">ASSIGNED CLIENTS</button>
        <button class="tab-btn" [class.active]="currentTab === 'builder'" (click)="currentTab = 'builder'">WORKOUT & DIET BUILDER</button>
        <button class="tab-btn" [class.active]="currentTab === 'earnings'" (click)="currentTab = 'earnings'">EARNINGS & RATINGS</button>
      </div>

      <!-- TAB 1: Assigned Clients -->
      <div *ngIf="currentTab === 'clients'" class="card">
        <h2>Assigned Member Roster ({{ clients.length }})</h2>
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>CONTACT</th>
                <th>PT CREDITS</th>
                <th>MEDICAL & EMERGENCY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clients">
                <td class="font-bold">{{ c.name }}</td>
                <td class="mono-data">{{ c.email }}<br><span class="text-iron">{{ c.phone || 'No phone' }}</span></td>
                <td>
                  <span class="badge" [ngClass]="(c.ptSessionsBalance || 0) > 0 ? 'badge-active' : 'badge-error'">
                    {{ c.ptSessionsBalance || 0 }} Credits
                  </span>
                </td>
                <td class="text-iron" style="font-size: 0.85rem;">
                  <strong>Med:</strong> {{ c.medicalNotes || 'None' }}<br>
                  <strong>Emerg:</strong> {{ c.emergencyContact?.name ? c.emergencyContact?.name + ' (' + c.emergencyContact?.phone + ')' : 'None' }}
                </td>
                <td>
                  <button class="btn btn-sm btn-moss" [disabled]="(c.ptSessionsBalance || 0) <= 0" (click)="logPTSession(c._id)">
                    Log PT Session (-1)
                  </button>
                </td>
              </tr>
              <tr *ngIf="clients.length === 0">
                <td colspan="5" class="text-center text-iron py-2">No assigned athletes yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: Workout & Diet Builder -->
      <div *ngIf="currentTab === 'builder'" class="card">
        <h2>Prescribe Workout Plan & Nutrition Macros</h2>
        <form (ngSubmit)="saveWorkoutPlan()">
          <div class="grid gap-1 mb-1" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label>Select Athlete</label>
              <select [(ngModel)]="wbClientId" name="client" required>
                <option value="" disabled>-- Choose Athlete --</option>
                <option *ngFor="let c of clients" [value]="c._id">{{ c.name }} ({{ c.email }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Plan Title</label>
              <input type="text" [(ngModel)]="wbTitle" name="title" placeholder="e.g. 4-Week Hypertrophy Split" required>
            </div>
          </div>

          <div class="form-group">
            <label>Athlete Goal Summary</label>
            <input type="text" [(ngModel)]="wbGoals" name="goals" placeholder="e.g. Progressive overload on compound lifts & calorie surplus">
          </div>

          <h3 class="mt-2 mb-1">Prescribed Exercises</h3>
          <div *ngFor="let ex of exerciseRows; let i = index" class="grid gap-1 mb-1" style="grid-template-columns: 2fr 1fr 1fr 1fr auto;">
            <input type="text" [(ngModel)]="ex.name" [name]="'ex_name_' + i" placeholder="Exercise Name (e.g. Barbell Squat)" required>
            <input type="number" [(ngModel)]="ex.sets" [name]="'ex_sets_' + i" placeholder="Sets" required>
            <input type="text" [(ngModel)]="ex.reps" [name]="'ex_reps_' + i" placeholder="Reps (10-12)" required>
            <input type="number" [(ngModel)]="ex.restSeconds" [name]="'ex_rest_' + i" placeholder="Rest (s)">
            <button type="button" class="btn btn-sm btn-danger" (click)="removeExerciseRow(i)">&times;</button>
          </div>
          <button type="button" class="btn btn-sm btn-outline mb-2" (click)="addExerciseRow()">+ Add Exercise Row</button>

          <h3 class="mt-2 mb-1">Nutrition & Macro Targets</h3>
          <div class="grid gap-1" style="grid-template-columns: repeat(4, 1fr);">
            <div class="form-group">
              <label>Daily Calories</label>
              <input type="number" [(ngModel)]="wbCalories" name="cal">
            </div>
            <div class="form-group">
              <label>Protein (g)</label>
              <input type="number" [(ngModel)]="wbProtein" name="protein">
            </div>
            <div class="form-group">
              <label>Carbs (g)</label>
              <input type="number" [(ngModel)]="wbCarbs" name="carbs">
            </div>
            <div class="form-group">
              <label>Fats (g)</label>
              <input type="number" [(ngModel)]="wbFats" name="fats">
            </div>
          </div>

          <button type="submit" class="btn btn-primary mt-1 w-full">Publish & Assign Routine</button>
        </form>
      </div>

      <!-- TAB 3: Earnings & Ratings -->
      <div *ngIf="currentTab === 'earnings'" class="grid gap-2" style="grid-template-columns: 1fr 1fr;">
        <div class="card status-charcoal">
          <span class="badge badge-warning mb-1">PT COMMISSIONS</span>
          <h2>Earnings Summary</h2>
          <p class="mono-data text-chalk" style="font-size: 3.5rem;">\${{ earningsData?.totalEarnings || 0 }}</p>
          <p class="text-iron">Completed 1-on-1 Sessions: {{ earningsData?.completedPTSessions || 0 }}</p>
          <p class="text-iron">Base Hourly PT Rate: \${{ earningsData?.ratePerSession || 50 }}/hr</p>
        </div>
        <div class="card status-active">
          <span class="badge badge-active mb-1">REPUTATION</span>
          <h2>Coach Rating</h2>
          <p class="mono-data" style="font-size: 3.5rem;">⭐ {{ earningsData?.rating || 4.9 }}</p>
          <p class="text-iron">Total Reviews Received: {{ earningsData?.ratingCount || 12 }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trainer-header-card {
      background: var(--charcoal);
      color: var(--stone);
      padding: 1.5rem 2rem;
      border-radius: 8px;
      border-left: 6px solid var(--chalk-yellow);
    }
    .trainer-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--chalk-yellow);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .tab-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--iron);
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--iron);
      font-family: var(--font-mono);
      font-weight: 700;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--charcoal);
      color: var(--chalk-yellow);
    }
  `]
})
export class TrainerDashboardComponent implements OnInit {
  private trainerService = inject(TrainerService);

  currentTab: 'clients' | 'builder' | 'earnings' = 'clients';
  clients: User[] = [];
  earningsData: any = null;

  // Form State
  wbClientId = '';
  wbTitle = '';
  wbGoals = '';
  wbCalories = 2400;
  wbProtein = 160;
  wbCarbs = 220;
  wbFats = 70;

  exerciseRows = [
    { name: 'Barbell Back Squat', sets: 3, reps: '8-10', restSeconds: 90 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60 },
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', restSeconds: 75 }
  ];

  ngOnInit() {
    this.loadClients();
    this.loadEarnings();
  }

  loadClients() {
    this.trainerService.getMyClients().subscribe({
      next: (res) => {
        this.clients = res.data?.clients || [];
      }
    });
  }

  loadEarnings() {
    this.trainerService.getEarningsSummary().subscribe({
      next: (res) => {
        this.earningsData = res.data;
      }
    });
  }

  addExerciseRow() {
    this.exerciseRows.push({ name: '', sets: 3, reps: '10', restSeconds: 60 });
  }

  removeExerciseRow(index: number) {
    if (this.exerciseRows.length > 1) {
      this.exerciseRows.splice(index, 1);
    }
  }

  logPTSession(memberId: string) {
    if (!confirm('Log completed 1-on-1 PT session and deduct 1 session credit from member?')) return;
    this.trainerService.logPTSession(memberId).subscribe({
      next: () => {
        alert('PT Session logged successfully!');
        this.loadClients();
        this.loadEarnings();
      },
      error: (err) => {
        alert(err.error?.message || 'Error logging session.');
      }
    });
  }

  saveWorkoutPlan() {
    if (!this.wbClientId || !this.wbTitle) {
      alert('Please select a client and provide a plan title.');
      return;
    }

    const payload = {
      userId: this.wbClientId,
      title: this.wbTitle,
      goals: this.wbGoals,
      exercises: this.exerciseRows,
      nutritionTarget: {
        dailyCalories: this.wbCalories,
        proteinGrams: this.wbProtein,
        carbsGrams: this.wbCarbs,
        fatsGrams: this.wbFats
      }
    };

    this.trainerService.saveWorkoutPlan(payload as any).subscribe({
      next: () => {
        alert('Workout plan & Nutrition targets successfully assigned to member!');
        this.currentTab = 'clients';
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to save workout plan.');
      }
    });
  }
}
