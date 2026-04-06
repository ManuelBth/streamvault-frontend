import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminContentService } from '../../services/admin-content.service';
import { DashboardStatsComponent } from '../../components/dashboard-stats/dashboard-stats.component';
import { DashboardStats } from '../../components/dashboard-stats/dashboard-stats.component';
import { forkJoin } from 'rxjs';

export interface ChartOptions {
  series: any[];
  chart: any;
  xaxis: any;
  colors: string[];
  stroke: any;
  dataLabels: any;
  legend: any;
  labels: string[];
  plotOptions: any;
  yaxis: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, DashboardStatsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private adminContentService = inject(AdminContentService);

  stats = signal<DashboardStats>({
    totalUsers: 0,
    totalContent: 0,
    activeSubscriptions: 0
  });

  isLoading = signal<boolean>(true);

  // Bar chart: Usuarios por rol (ROLE_USER vs ROLE_ADMIN)
  userRoleChartOptions: Partial<ChartOptions> = {
    series: [
      { name: 'Usuarios', data: [0, 0] }
    ],
    chart: {
      type: 'bar',
      height: 300,
      background: 'transparent',
      toolbar: { show: false }
    },
    colors: ['#6366F1', '#E50914'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '50%'
      }
    },
    xaxis: {
      categories: ['Usuarios', 'Administradores'],
      labels: { style: { colors: '#B3B3B3' } }
    },
    yaxis: {
      labels: { style: { colors: '#B3B3B3' } }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#FFFFFF'] }
    },
    legend: { show: false }
  };

  // Bar chart: Contenido por género
  genreChartOptions: Partial<ChartOptions> = {
    series: [
      { name: 'Contenido', data: [] }
    ],
    chart: {
      type: 'bar',
      height: 300,
      background: 'transparent',
      toolbar: { show: false }
    },
    colors: ['#E50914'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4
      }
    },
    xaxis: {
      categories: [],
      labels: { style: { colors: '#B3B3B3' } }
    },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  // Donut chart: Movies vs Series
  contentTypeChartOptions: Partial<ChartOptions> = {
    series: [0, 0],
    chart: {
      type: 'donut',
      height: 300,
      background: 'transparent'
    },
    colors: ['#E50914', '#6366F1'],
    labels: ['Películas', 'Series'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { color: '#FFFFFF' },
            value: { color: '#FFFFFF' },
            total: {
              show: true,
              label: 'Total',
              color: '#B3B3B3',
              formatter: () => '0'
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#B3B3B3' }
    },
    dataLabels: { enabled: false }
  };

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Cargar usuarios y géneros en paralelo
    this.adminUserService.loadUsers(0, 1000);
    
    // Usar forkJoin para cargar contenidos y géneros en paralelo
    forkJoin({
      contents: this.adminContentService.getAllContents(0, 1000),
      genres: this.adminContentService.getGenres()
    }).subscribe({
      next: ({ contents, genres }) => {
        // Process users by role
        const userState = this.adminUserService.users();
        let roleUserCount = 0;
        let roleAdminCount = 0;
        if (userState.state === 'success' && userState.data?.users) {
          userState.data.users.forEach(u => {
            if (u.role === 'ROLE_ADMIN') {
              roleAdminCount++;
            } else {
              roleUserCount++;
            }
          });
        }

        // Process content by type
        let moviesCount = 0;
        let seriesCount = 0;
        if (contents.content) {
          contents.content.forEach(c => {
            if (c.type === 'MOVIE') {
              moviesCount++;
            } else {
              seriesCount++;
            }
          });
        }

        // Process content by genre - agrupar por género
        const genreCountMap = new Map<string, number>();
        if (contents.content) {
          contents.content.forEach(c => {
            if (c.genres && c.genres.length > 0) {
              c.genres.forEach(g => {
                const current = genreCountMap.get(g.name) || 0;
                genreCountMap.set(g.name, current + 1);
              });
            }
          });
        }

        // Convertir a arrays para el chart (top 6 géneros)
        const sortedGenres = Array.from(genreCountMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);
        const genreLabels = sortedGenres.map(g => g[0]);
        const genreData = sortedGenres.map(g => g[1]);

        // Update charts with real data
        this.userRoleChartOptions = {
          ...this.userRoleChartOptions,
          series: [{ name: 'Usuarios', data: [roleUserCount, roleAdminCount] }]
        };

        this.genreChartOptions = {
          ...this.genreChartOptions,
          series: [{ name: 'Contenido', data: genreData }],
          xaxis: {
            categories: genreLabels,
            labels: { style: { colors: '#B3B3B3' } }
          }
        };

        this.contentTypeChartOptions = {
          ...this.contentTypeChartOptions,
          series: [moviesCount, seriesCount],
          plotOptions: {
            pie: {
              donut: {
                size: '70%',
                labels: {
                  show: true,
                  name: { color: '#FFFFFF' },
                  value: { color: '#FFFFFF' },
                  total: {
                    show: true,
                    label: 'Total',
                    color: '#B3B3B3',
                    formatter: () => String(moviesCount + seriesCount)
                  }
                }
              }
            }
          }
        };

        this.stats.set({
          totalUsers: roleUserCount + roleAdminCount,
          totalContent: moviesCount + seriesCount,
          activeSubscriptions: 0
        });
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading.set(false);
      }
    });
  }
}
