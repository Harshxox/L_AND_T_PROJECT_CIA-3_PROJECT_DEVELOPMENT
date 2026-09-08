import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../../core/services/progress.service';
import { TrainerService } from '../../core/services/trainer.service';
import { ProgressLog, WorkoutPlan } from '../../core/models/progress.model';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1>BODY TRANSFORMATION & ROUTINE</h1>
          <p class="text-iron">Log body metrics and follow your assigned workout & diet routine.</p>
        </div>
        <button class="btn btn-primary" (click)="isLogModalOpen = true">+ Log Body Metrics</button>
      </div>

      <!-- Highlights -->
      <div class="grid gap-2 mb-3" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <div class="card status-active">
          <span class="badge badge-active mb-1">CURRENT WEIGHT</span>
          <h2>{{ latestLog?.weightKg || '--' }} kg</h2>
          <p class="text-iron mono-data">{{ latestLog?.date ? (latestLog?.date | date:'mediumDate') : 'No logs yet' }}</p>
        </div>
        <div class="card status-warning">
          <span class="badge badge-warning mb-1">BODY COMPOSITION</span>
          <h2>{{ latestLog?.bodyFatPercentage ? latestLog?.bodyFatPercentage + '%' : '--' }}</h2>
          <p class="text-iron mono-data">Muscle: {{ latestLog?.muscleMassKg ? latestLog?.muscleMassKg + ' kg' : '--' }}</p>
        </div>
        <div class="card status-charcoal">
          <span class="badge badge-active mb-1">BENCH / SQUAT / DL</span>
          <h2>{{ latestLog?.benchPressPR || '--' }} / {{ latestLog?.squatPR || '--' }} / {{ latestLog?.deadliftPR || '--' }}</h2>
          <p class="text-iron mono-data">PR Milestones (kg)</p>
        </div>
      </div>

      <div class="grid gap-3" style="grid-template-columns: 1.1fr 0.9fr;">
        <!-- Workout & Nutrition Routine -->
        <div class="card status-charcoal p-0 overflow-hidden">
          <div class="nutrition-header-banner">
            <span class="badge badge-warning">COACH ASSIGNED</span>
            <span class="badge badge-active">Target Split</span>
          </div>

          <div class="p-2">
            <h2>Assigned Routine & Diet</h2>
            <div *ngIf="routine; else noRoutine">
              <h3 class="text-chalk mb-1">{{ routine.title }}</h3>
              <p class="text-iron mb-2">Goals: {{ routine.goals || 'Strength & Hypertrophy' }}</p>

              <h4 class="mb-1">Prescribed Exercises</h4>
              <div class="mb-2">
                <div *ngFor="let ex of routine.exercises; let idx = index" class="flex justify-between items-center mb-1" style="border-bottom: 1px solid rgba(74,71,68,0.2); padding-bottom: 0.35rem;">
                  <span><strong>{{ idx + 1 }}. {{ ex.name }}</strong></span>
                  <span class="mono-data">{{ ex.sets }} sets × {{ ex.reps }} ({{ ex.restSeconds || 60 }}s rest)</span>
                </div>
              </div>

              <h4 class="mb-1">Daily Macro Targets</h4>
              <div class="grid gap-1 mb-2" style="grid-template-columns: repeat(4, 1fr);">
                <div class="card" style="padding: 0.5rem; text-align: center;">
                  <span class="mono-data font-bold">{{ routine.nutritionPlan?.dailyCalories || 2400 }}</span>
                  <div style="font-size: 0.75rem;" class="text-iron">CALORIES</div>
                </div>
                <div class="card" style="padding: 0.5rem; text-align: center;">
                  <span class="mono-data font-bold text-moss">{{ routine.nutritionPlan?.proteinGrams || 160 }}g</span>
                  <div style="font-size: 0.75rem;" class="text-iron">PROTEIN</div>
                </div>
                <div class="card" style="padding: 0.5rem; text-align: center;">
                  <span class="mono-data font-bold">{{ routine.nutritionPlan?.carbsGrams || 220 }}g</span>
                  <div style="font-size: 0.75rem;" class="text-iron">CARBS</div>
                </div>
                <div class="card" style="padding: 0.5rem; text-align: center;">
                  <span class="mono-data font-bold">{{ routine.nutritionPlan?.fatsGrams || 70 }}g</span>
                  <div style="font-size: 0.75rem;" class="text-iron">FATS</div>
                </div>
              </div>
            </div>
            <ng-template #noRoutine>
              <div class="py-2">
                <p class="text-iron">No routine assigned yet. Ask Coach Marcus to prescribe your personalized lifting split and macro plan.</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Historical Log -->
        <div class="card">
          <h2>Progress Log History</h2>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>WEIGHT</th>
                  <th>BODY FAT</th>
                  <th>MUSCLE</th>
                  <th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let l of logs">
                  <td class="mono-data">{{ l.date | date:'mediumDate' }}</td>
                  <td class="mono-data font-bold">{{ l.weightKg }} kg</td>
                  <td class="mono-data">{{ l.bodyFatPercentage ? l.bodyFatPercentage + '%' : '--' }}</td>
                  <td class="mono-data">{{ l.muscleMassKg ? l.muscleMassKg + ' kg' : '--' }}</td>
                  <td class="text-iron">{{ l.notes || '--' }}</td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="5" class="text-center text-iron py-2">No metric logs recorded yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Modal -->
    <div class="modal-overlay" *ngIf="isLogModalOpen">
      <div class="modal-card">
        <div class="flex justify-between items-center mb-2">
          <h2>LOG BODY MEASUREMENTS</h2>
          <button (click)="isLogModalOpen = false" style="background:none; border:none; font-size: 1.5rem; cursor:pointer;">&times;</button>
        </div>

        <form (ngSubmit)="submitLog()">
          <div class="grid gap-1" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label>Weight (kg)*</label>
              <input type="number" step="0.1" [(ngModel)]="newWeight" name="weight" required placeholder="75.5">
            </div>
            <div class="form-group">
              <label>Body Fat %</label>
              <input type="number" step="0.1" [(ngModel)]="newBodyFat" name="bodyFat" placeholder="15.2">
            </div>
          </div>
          <div class="grid gap-1" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label>Muscle Mass (kg)</label>
              <input type="number" step="0.1" [(ngModel)]="newMuscle" name="muscle" placeholder="38.0">
            </div>
            <div class="form-group">
              <label>Waist (cm)</label>
              <input type="number" step="0.5" [(ngModel)]="newWaist" name="waist" placeholder="82">
            </div>
          </div>
          <div class="grid gap-1" style="grid-template-columns: 1fr 1fr 1fr;">
            <div class="form-group">
              <label>Bench PR (kg)</label>
              <input type="number" [(ngModel)]="newBench" name="bench" placeholder="100">
            </div>
            <div class="form-group">
              <label>Squat PR (kg)</label>
              <input type="number" [(ngModel)]="newSquat" name="squat" placeholder="140">
            </div>
            <div class="form-group">
              <label>Deadlift PR (kg)</label>
              <input type="number" [(ngModel)]="newDeadlift" name="deadlift" placeholder="180">
            </div>
          </div>
          <div class="form-group">
            <label>Notes / Workout Feedback</label>
            <input type="text" [(ngModel)]="newNotes" name="notes" placeholder="Hit new PR on bench, felt energized!">
          </div>

          <button type="submit" class="btn btn-primary w-full mt-1">Save Measurements</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .nutrition-header-banner {
      height: 140px;
      background: linear-gradient(to bottom, rgba(28,27,26,0.3), rgba(28,27,26,0.9)), url('/images/nutrition.jpg') center/cover no-repeat;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem;
      border-bottom: 2px solid var(--charcoal);
    }
  `]
})
export class ProgressComponent implements OnInit {
  private progressService = inject(ProgressService);
  private trainerService = inject(TrainerService);

  logs: ProgressLog[] = [];
  latestLog: ProgressLog | null = null;
  routine: WorkoutPlan | null = null;

  isLogModalOpen = false;

  newWeight: number | null = null;
  newBodyFat: number | null = null;
  newMuscle: number | null = null;
  newWaist: number | null = null;
  newBench: number | null = null;
  newSquat: number | null = null;
  newDeadlift: number | null = null;
  newNotes = '';

  ngOnInit() {
    this.loadProgressData();
  }

  loadProgressData() {
    this.progressService.getMyProgress().subscribe({
      next: (res: any) => {
        this.logs = res.data?.logs || [];
        this.latestLog = this.logs[0] || null;
      }
    });

    this.trainerService.getMyWorkoutPlans().subscribe({
      next: (res: any) => {
        const plans = res.data?.plans || [];
        this.routine = plans[0] || null;
      }
    });
  }

  submitLog() {
    if (!this.newWeight) {
      alert('Weight is required');
      return;
    }

    const payload = {
      weightKg: this.newWeight,
      bodyFatPercentage: this.newBodyFat || undefined,
      muscleMassKg: this.newMuscle || undefined,
      waistCircumferenceCm: this.newWaist || undefined,
      benchPressPR: this.newBench || undefined,
      squatPR: this.newSquat || undefined,
      deadliftPR: this.newDeadlift || undefined,
      notes: this.newNotes
    };

    this.progressService.logProgress(payload).subscribe({
      next: () => {
        alert('Body metrics logged successfully!');
        this.isLogModalOpen = false;
        this.loadProgressData();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to save progress.');
      }
    });
  }
}
