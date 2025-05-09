import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Nota } from '../../../core/models/nota.model';
import { Conferencia, ConferenciaItem } from '../../../core/models/conferencia.model';
import { NotaService } from '../../../core/services/nota.service';
import { ItemService } from '../../../core/services/item.service';
import { ConferenciaService } from '../../../core/services/conferencia.service';

@Component({
  selector: 'app-conferencia-entrada',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conferencia-entrada.component.html',
  styleUrls: ['./conferencia-entrada.component.scss']
})
export class ConferenciaEntradaComponent implements OnInit {
  etapa = 1;

  formMeta: FormGroup;
  notaId!: number;
  nota?: Nota;
  loadingNota = false;

  formItem: FormGroup;
  items: ConferenciaItem[] = [];

  salvando = false;
  erro: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private notaService: NotaService,
    private itemService: ItemService,
    private confService: ConferenciaService
  ) {
    this.formMeta = this.fb.group({
      numeroNota: ['', Validators.required],
      serieNota: ['', Validators.required],
      chaveRegistro: [{ value: this.generateChave(), disabled: true }]
    });
    this.formItem = this.fb.group({
      codigo: ['', Validators.required],
      descricao: [''],
      embalagem: [''],
      estoque: [0],
      precoVenda: [0],
      precoCusto: [0],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.notaId = +p['notaId'] || 0;
      if (this.notaId) this.loadNota();
    });
    this.formItem.get('codigo')!.valueChanges.subscribe(val => {
      if (val && val.length > 3) {
        this.itemService.buscarPorCodigo(val).subscribe(list => {
          if (list.length) {
            const it = list[0];
            this.formItem.patchValue({
              descricao: it.descricao,
              embalagem: it.embalagem,
              estoque: it.estoque,
              precoVenda: it.precoVenda,
              precoCusto: it.precoCusto
            });
          }
        });
      }
    });
  }

  private loadNota(): void {
    this.loadingNota = true;
    this.notaService.listarNotas().subscribe({
      next: list => {
        this.nota = list.find(n => n.id === this.notaId) as Nota;
        if (this.nota) {
          this.formMeta.patchValue({ numeroNota: this.nota.numero });
        }
        this.loadingNota = false;
      },
      error: () => this.loadingNota = false
    });
  }

  generateChave(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  next(): void {
    if (this.formMeta.invalid) return;
    this.etapa = 2;
  }

  back(): void {
    if (this.etapa === 1) {
      this.router.navigate(['/nota-fiscal']);
    } else {
      this.etapa = 1;
    }
  }

  addItem(): void {
    if (this.formItem.invalid) return;
    const { codigo, descricao, quantidade } = this.formItem.value;
    this.items.push({ codigo, descricao, quantidade });
    this.formItem.reset({
      codigo: '',
      descricao: '',
      embalagem: '',
      estoque: 0,
      precoVenda: 0,
      precoCusto: 0,
      quantidade: 1
    });
  }

  rm(i: number): void {
    this.items.splice(i, 1);
  }

  finalize(): void {
    if (this.items.length === 0) {
      this.erro = 'Adicione ao menos 1 item.';
      return;
    }
    this.salvando = true;
    const conf: Conferencia = {
      notaId: this.notaId,
      numeroNota: this.formMeta.value.numeroNota,
      serieNota: this.formMeta.value.serieNota,
      chaveRegistro: this.formMeta.getRawValue().chaveRegistro,
      items: this.items,
      data: new Date().toISOString()
    };
    this.confService.criar(conf).subscribe({
      next: () => this.router.navigate(['/nota-fiscal']),
      error: () => {
        this.erro = 'Falha ao salvar.';
        this.salvando = false;
      }
    });
  }
}
