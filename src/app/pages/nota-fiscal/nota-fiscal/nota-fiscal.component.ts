import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Nota } from '../../../core/models/nota.model';
import { NotaService } from '../../../core/services/nota.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nota-fiscal',
  imports: [CommonModule],
  templateUrl: './nota-fiscal.component.html',
  styleUrl: './nota-fiscal.component.scss'
})
export class NotaFiscalComponent implements OnInit {
  notas: Nota[] = [];
  carregando = false;
  erro: string | null = null;

  constructor(
    private router: Router,
    private notaService: NotaService
  ) {}

  ngOnInit(): void {
    this.carregarNotas();
  }

  carregarNotas(): void {
    this.carregando = true;
    this.erro = null;
    this.notaService.listarNotas().subscribe({
      next: (res) => {
        this.notas = res;
        this.carregando = false;
      },
      error: (err) => {
        this.erro = 'Falha ao carregar notas.';
        this.carregando = false;
      }
    });
  }

  incluir(): void {
    // envia a nota selecionada ou a primeira
    const notaId = this.notas.length ? this.notas[0].id : null;
    this.router.navigate(['/conferencia-entrada'], { queryParams: { notaId } });
  }


  editar(nota: Nota): void {
    // futuro: navegar para editar conferência dessa nota
    console.log('Editar nota', nota);
  }
}
