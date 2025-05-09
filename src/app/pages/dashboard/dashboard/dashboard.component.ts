import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule]
})
export class DashboardComponent {
  cards = [
    { title: 'Nota Fiscal', route: 'nota-fiscal' },
    { title: 'Histórico', route: 'historico' },
    { title: 'Configurações', route: 'config' }
  ];

  constructor(private router: Router) {}

  navigate(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
