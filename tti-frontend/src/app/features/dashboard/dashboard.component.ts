import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { StatisticsService } from '../../core/services/statistics.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    MatProgressSpinnerModule
  ],
})
export class DashboardComponent {
  public barChartLegend = true;
  public barChartPlugins = [];

  loading = true;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Tasks Created' },
    ]
  };

  public projectMemberStatsData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Project Members' },
    ]
  };
  public userActivityStatsData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Task Count' },
      { data: [], label: 'Completed Tasks' },
      { data: [], label: 'Completion Rate' },
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };
  constructor(private statisticsService: StatisticsService) {}

  ngOnInit() {
    this.getTasksOverTime();
    this.getProjectMemberStats();
    this.getUserActivityStats();
  }

  getTasksOverTime() {
    this.loading = true;
    this.statisticsService.getTasksOverTime().subscribe((data) => {
      console.log(data);
      this.barChartData.labels = data.map((item) => item.date);
      this.barChartData.datasets[0].data = data.map((item) => item.count);
      this.loading = false;
    });
  }

  getProjectMemberStats() {
    this.loading = true;
    this.statisticsService.getProjectMemberStats().subscribe((data) => {
      console.log(data);
      this.projectMemberStatsData.labels = data.map((item) => item.name);
      this.projectMemberStatsData.datasets[0].data = data.map((item) => item.memberCount);
      this.loading = false;
    });
  }

  getUserActivityStats() {
    this.loading = true;
    this.statisticsService.getUserActivityStats().subscribe((data) => {
      console.log(data);
      this.userActivityStatsData.labels = data.map((item) => item.name);
      this.userActivityStatsData.datasets[0].data = data.map((item) => item.taskCount);
      this.userActivityStatsData.datasets[1].data = data.map((item) => item.completedTasks);
      this.userActivityStatsData.datasets[2].data = data.map((item) => item.completionRate);
      this.loading = false;
    });
  }
}
