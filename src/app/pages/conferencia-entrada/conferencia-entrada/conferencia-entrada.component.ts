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
import { Nota } from '../../../core/models/nota.model';
import { Item } from '../../../core/models/item.model';
import { ConferenciaItem, Conferencia } from '../../../core/models/conferencia.model';
import { ConferenciaService } from '../../../core/services/conferencia.service';
import { ItemService } from '../../../core/services/item.service';
import { NotaService } from '../../../core/services/nota.service';



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
  etapa = 1;
  formMeta: FormGroup;
  formItem: FormGroup;
  showScanner = false;
  availableFormats = [ BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.EAN_8 ];

  nota?: Nota;
  currentItem: Item | null = null;
  items: ConferenciaItem[] = [];

  erro: string | null = null;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notaService: NotaService,
    private itemService: ItemService,
    private confService: ConferenciaService
  ) {
    // ETAPA 1
    this.formMeta = this.fb.group({
      numeroNota: ['', Validators.required],
      serieNota: ['', Validators.required],
      chaveRegistro: [{ value: this.generateChave(), disabled: true }]
    });
    // ETAPA 2
    this.formItem = this.fb.group({
      codigo: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      embalagem: [1, [Validators.required, Validators.min(1)]],
      total: [{ value: 1, disabled: true }],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      const id = +p['notaId'] || 0;
      if (id) {
        this.notaService.listarNotas().subscribe(list => {
          this.nota = list.find(n => n.id === id);
          if (this.nota) {
            this.formMeta.patchValue({
              numeroNota: this.nota.numero,
              serieNota: this.nota.serie
            });
          }
        });
      }
    });

    // Quando muda código, busca item
    this.formItem.get('codigo')!.valueChanges.subscribe(code => {
      this.currentItem = null;
      this.formItem.patchValue({ descricao: '', embalagem: 1, total: 1 }, { emitEvent: false });
      if (code && code.length > 3) {
        this.itemService.buscarPorCodigo(code).subscribe(arr => {
          if (arr.length) {
            this.currentItem = arr[0];
            this.formItem.patchValue({ descricao: this.currentItem.descricao }, { emitEvent: false });
            this.updateTotal();
          }
        });
      }
    });

    // Recalcula total sempre que qtd ou embalagem mudam
    this.formItem.get('quantidade')!.valueChanges.subscribe(_ => this.updateTotal());
    this.formItem.get('embalagem')!.valueChanges.subscribe(_ => this.updateTotal());
  }

  private generateChave(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  private updateTotal(): void {
    const qtd = this.formItem.get('quantidade')!.value || 0;
    const emb = this.formItem.get('embalagem')!.value || 1;
    this.formItem.get('total')!.setValue(qtd * emb, { emitEvent: false });
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

  toggleScanner(): void {
    this.showScanner = !this.showScanner;
  }
  onCodeResult(code: string): void {
    this.showScanner = false;
    this.formItem.patchValue({ codigo: code });
  }

  addItem(): void {
    if (!this.currentItem || this.formItem.invalid) return;
    const { codigo, quantidade, descricao } = this.formItem.value;
    this.items.push({ codigo, quantidade, descricao });
    // limpa formItem
    this.formItem.reset({ codigo: '', quantidade: 1, embalagem: 1, total: 1, descricao: '' });
    this.currentItem = null;
  }
  removeItem(i: number): void {
    this.items.splice(i, 1);
  }

  finalize(): void {
    if (!this.items.length) {
      this.erro = 'Adicione ao menos um item.';
      return;
    }
    this.salvando = true;
    const conf: Conferencia = {
      notaId: this.nota!.id!,
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
