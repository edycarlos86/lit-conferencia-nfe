import { Routes } from '@angular/router';
import { ConferenciaEntradaComponent } from './pages/conferencia-entrada/conferencia-entrada/conferencia-entrada.component';
import { NotaFiscalComponent } from './pages/nota-fiscal/nota-fiscal/nota-fiscal.component';
import { LoginComponent } from './pages/login/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';
import { SplashScreenComponent } from './pages/splash-screen/splash-screen/splash-screen.component';


export const routes: Routes = [
  { path: '', component: SplashScreenComponent  },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'nota-fiscal', component: NotaFiscalComponent },
  { path: 'conferencia-entrada', component: ConferenciaEntradaComponent },
  { path: '**', redirectTo: '' }
];
