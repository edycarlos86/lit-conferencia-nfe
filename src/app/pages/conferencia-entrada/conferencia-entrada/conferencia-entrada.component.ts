import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';



import { NotaService } from '../../../core/services/nota.service';
import { Conferencia, ConferenciaItem } from '../../../core/models/conferencia.model';
import { Nota } from '../../../core/models/nota.model';
import { ItemService } from '../../../core/services/item.service';
import { ConferenciaService } from '../../../core/services/conferencia.service';

@Component({
  selector: 'app-conferencia-entrada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZXingScannerModule
  ],
  templateUrl: './conferencia-entrada.component.html',
  styleUrls: ['./conferencia-entrada.component.scss']
})
export class ConferenciaEntradaComponent implements OnInit {
  etapa = 1;               // 1 = Dados da NFe, 2 = Incluir Itens
  showScanner = false;     // controla exibição do scanner
  public availableFormats = [   // formatos válidos
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_8
  ];

  formMeta: FormGroup;
  formItem: FormGroup;
  items: ConferenciaItem[] = [];

  notaId!: number;
  nota?: Nota;
  loadingNota = false;

  salvando = false;
  erro: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notaService: NotaService,
    private itemService: ItemService,
    private confService: ConferenciaService
  ) {
    // Etapa 1 – Dados da NFe + Senha (readonly)
    this.formMeta = this.fb.group({
      numeroNota: ['', Validators.required],
      serieNota: ['', Validators.required],
      chaveRegistro: [{ value: this.generateChave(), disabled: true }]
    });

    // Etapa 2 – Inclusão de itens
    this.formItem = this.fb.group({
      codigo: ['', Validators.required],
      descricao: [''],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.notaId = +p['notaId'] || 0;
      if (this.notaId) {
        this.loadNota();
      }
    });

    // Quando o código muda (manual ou via scan), preenche descrição
    this.formItem.get('codigo')!.valueChanges.subscribe(val => {
      if (val && val.length > 3) {
        this.itemService.buscarPorCodigo(val).subscribe(list => {
          if (list.length) {
            this.formItem.patchValue({ descricao: list[0].descricao });
          }
        });
      }
    });
  }

  private loadNota(): void {
    this.loadingNota = true;
    this.notaService.listarNotas().subscribe({
      next: list => {
        this.nota = list.find(n => n.id === this.notaId);
        if (this.nota) {
          this.formMeta.patchValue({ numeroNota: this.nota.numero });
        }
        this.loadingNota = false;
      },
      error: () => this.loadingNota = false
    });
  }

  private generateChave(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  // Navegação entre etapas
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

  // Scanner
  toggleScanner(): void {
    this.showScanner = !this.showScanner;
  }
  onCodeResult(result: string): void {
    this.showScanner = false;
    this.formItem.patchValue({ codigo: result });
  }

  // Adicionar/Remover itens
  addItem(): void {
    if (this.formItem.invalid) return;
    const { codigo, descricao, quantidade } = this.formItem.value;
    this.items.push({ codigo, descricao, quantidade });
    this.formItem.reset({ codigo: '', descricao: '', quantidade: 1 });
  }
  rm(i: number): void {
    this.items.splice(i, 1);
  }

  // Finalizar conferência
  finalize(): void {
    if (!this.items.length) {
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
