import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ZXingScannerModule,
  ZXingScannerComponent
} from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ConferenciaItem, Conferencia } from '../../../core/models/conferencia.model';
import { Item } from '../../../core/models/item.model';
import { Nota } from '../../../core/models/nota.model';
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
export class ConferenciaEntradaComponent implements OnInit, AfterViewInit {
  @ViewChild('scanner') scannerComponent!: ZXingScannerComponent;

  etapa = 1;
  formMeta: FormGroup;
  formItem: FormGroup;

  showScanner = false;
  availableFormats = [ BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.EAN_8 ];
  currentDevice?: MediaDeviceInfo;

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
    this.formMeta = this.fb.group({
      numeroNota: ['', Validators.required],
      serieNota: ['', Validators.required],
      chaveRegistro: [{ value: this.generateChave(), disabled: true }]
    });
    this.formItem = this.fb.group({
      codigo: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      embalagem: [1, [Validators.required, Validators.min(1)]],
      total: [{ value: 1, disabled: true }],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    // carrega nota se houver
    this.route.queryParams.subscribe(p => {
      const id = +p['notaId'] || 0;
      if (id) {
        this.notaService.listarNotas().subscribe(list => {
          this.nota = list.find(n => n.id === id);
          if (this.nota) {
            this.formMeta.patchValue({
              numeroNota: this.nota.numero,
              serieNota: (this.nota as any).serie || ''
            });
          }
        });
      }
    });

    // buscar item ao alterar código
    this.formItem.get('codigo')!.valueChanges.subscribe(code => {
      this.currentItem = null;
      this.formItem.patchValue({ descricao: '', embalagem: 1, total: 1 }, { emitEvent: false });
      if (code && code.length > 3) {
        this.itemService.buscarPorCodigo(code).subscribe(arr => {
          if (arr.length) {
            this.currentItem = arr[0];
            this.formItem.patchValue(
              { descricao: this.currentItem.descricao },
              { emitEvent: false }
            );
            this.updateTotal();
          }
        });
      }
    });

    // recalcular total
    this.formItem.get('quantidade')!.valueChanges.subscribe(_ => this.updateTotal());
    this.formItem.get('embalagem')!.valueChanges.subscribe(_ => this.updateTotal());
  }

  ngAfterViewInit(): void {
    // dispara o askForPermission para solicitar câmera
    this.scannerComponent.askForPermission();

    // quando listar câmeras, escolhe a traseira
    this.scannerComponent.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.currentDevice =
        devices.find(d => /back|rear|environment/gi.test(d.label)) || devices[0];
      this.scannerComponent.device = this.currentDevice;
    });

    this.scannerComponent.camerasNotFound.subscribe(() => {
      console.warn('Nenhuma câmera encontrada.');
    });
  }

  private generateChave(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  private updateTotal(): void {
    const qtd = this.formItem.value.quantidade || 0;
    const emb = this.formItem.value.embalagem || 1;
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
    this.showScanner = true;
  }

  onCodeResult(code: string): void {
    this.showScanner = false;
    this.formItem.patchValue({ codigo: code });
  }

  addItem(): void {
    if (!this.currentItem || this.formItem.invalid) return;
    const { codigo, descricao, quantidade } = this.formItem.value;
    this.items.push({ codigo, descricao, quantidade });
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
