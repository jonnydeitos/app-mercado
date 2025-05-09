import { Component } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { Preferences } from '@capacitor/preferences';
import { NotaFiscalService, NotaFiscal } from '../services/nota-fiscal.service';
import { ApiService, ProdutoHistorico } from '../services/api.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ScanPage {
  constructor(
    private notaFiscalService: NotaFiscalService,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async scanQRCode() {
    try {
      console.log('Iniciando verificação de suporte ao escaneamento...');
      const { supported } = await BarcodeScanner.isSupported();
      console.log('Escaneamento suportado:', supported);
      if (!supported) {
        console.log('Escaneamento não suportado');
        await this.showAlert(
          'Erro',
          'Escaneamento não suportado neste dispositivo.'
        );
        return;
      }

      console.log('Solicitando permissões de câmera...');
      const { camera } = await BarcodeScanner.requestPermissions();
      console.log('Permissões de câmera:', camera);
      if (camera !== 'granted') {
        console.log('Permissão de câmera negada');
        await this.showAlert(
          'Permissão Negada',
          'É necessário permitir o uso da câmera.'
        );
        return;
      }

      console.log('Iniciando escaneamento...');
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      console.log('Barcodes encontrados:', barcodes);

      if (barcodes.length > 0) {
        const rawUrl = barcodes[0].rawValue;
        const adjustedUrl = rawUrl.replace(
          'www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
          'dfe-portal.svrs.rs.gov.br/Dfe/QrCodeNFce'
        );
        console.log('URL ajustada:', adjustedUrl);

        const loading = await this.loadingController.create({
          message: 'Processando nota fiscal...',
          spinner: 'crescent',
        });
        await loading.present();

        this.notaFiscalService.fetchNotaFiscalData(adjustedUrl).subscribe({
          next: async (data) => {
            console.log('Dados da nota fiscal:', data);
            const numeroNFe =
              data.numeroNFe || this.extractNumeroNFe(adjustedUrl);
            if (!numeroNFe) {
              await loading.dismiss();
              console.log('Número da NFe não identificado');
              await this.showAlert(
                'Erro',
                'Não foi possível identificar o número da NFe.'
              );
              return;
            }

            const existingNotas = await this.getNotas();
            const notaExists = existingNotas.find(
              (nota) => nota.numeroNFe === numeroNFe
            );

            if (notaExists) {
              await loading.dismiss();
              console.log('Nota duplicada detectada:', numeroNFe);
              await this.showAlert(
                'Aviso',
                'Essa nota fiscal já foi lida e já consta no cadastro no aplicativo.'
              );
              const empresa = this.simplifyEmpresaName(notaExists.empresa);
              const notasDaEmpresa = existingNotas.filter(
                (nota) => this.simplifyEmpresaName(nota.empresa) === empresa
              );
              this.router.navigate(['/empresa-details'], {
                state: { empresa, notas: notasDaEmpresa },
              });
              return;
            }

            const produtos: ProdutoHistorico[] = data.itens.map((item) => ({
              id: '',
              nome: item.nome,
              categoria: 'outros',
              empresa: data.empresa,
              data: this.formatarData(data.data),
              valor_unitario: item.valorUnitario,
            }));

            for (const produto of produtos) {
              try {
                const result = await this.apiService
                  .adicionarProduto(produto)
                  .toPromise();
                console.log('Produto adicionado:', result);
              } catch (err) {
                console.error('Erro ao adicionar produto:', err);
                await loading.dismiss();
                await this.showAlert(
                  'Erro',
                  'Falha ao salvar o produto no banco de dados.'
                );
                return;
              }
            }

            data.numeroNFe = numeroNFe;
            existingNotas.push(data);
            await Preferences.set({
              key: 'notas',
              value: JSON.stringify(existingNotas),
            });

            await loading.dismiss();
            this.router.navigate(['/price-list']);
          },
          error: async (err) => {
            await loading.dismiss();
            console.error('Erro ao buscar dados:', err);
            await this.showAlert(
              'Erro',
              'Não foi possível carregar os dados da nota.'
            );
          },
        });
      } else {
        console.log('Nenhum QR code encontrado');
        await this.showAlert('Erro', 'Nenhum QR code encontrado.');
      }
    } catch (error) {
      console.error('Erro ao escanear:', error);
      await this.showAlert('Erro', 'Falha ao escanear o QR code.');
    }
  }

  private formatarData(data: string): string {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  async showAlert(header: string, message: string) {
    try {
      console.log('Exibindo alerta:', { header, message });
      const alert = await this.alertController.create({
        header,
        message,
        buttons: ['OK'],
      });
      await alert.present();
      console.log('Alerta exibido com sucesso');
    } catch (error) {
      console.error('Erro ao exibir o alerta:', error);
    }
  }

  extractNumeroNFe(url: string): string {
    const match = url.match(/p=([0-9]+)/);
    return match ? match[1] : url;
  }

  simplifyEmpresaName(empresa: string): string {
    const parts = empresa.split(/CNPJ|,\s*/);
    return parts[0].trim();
  }

  async getNotas(): Promise<any[]> {
    const { value } = await Preferences.get({ key: 'notas' });
    return value ? JSON.parse(value) : [];
  }

  goToPriceList() {
    this.router.navigate(['/price-list']);
  }
}
