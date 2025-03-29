import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { NotaFiscalService } from './nota-fiscal.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {
  constructor(
    private notaFiscalService: NotaFiscalService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController // Adicionado
  ) {}

  async scanQRCode() {
    // Verificar permissão da câmera
    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (!permission.granted) {
      this.showAlert(
        'Permissão Negada',
        'É necessário permitir o uso da câmera.'
      );
      return;
    }

    // Exibir o loader
    const loading = await this.loadingController.create({
      message: 'Escaneando e processando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // Iniciar o scan
      document.body.classList.add('scanner-active');
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      document.body.classList.remove('scanner-active');

      if (result.hasContent) {
        const url = result.content;
        // Fazer a requisição ao serviço
        this.notaFiscalService.fetchNotaFiscalData(url).subscribe({
          next: (data) => {
            this.router.navigate(['/price-list'], {
              state: { notaData: data },
            });
          },
          error: (err) => {
            this.showAlert(
              'Erro',
              'Não foi possível carregar os dados da nota.'
            );
            console.error(err);
          },
          complete: async () => {
            await loading.dismiss(); // Esconder o loader após sucesso ou erro
          },
        });
      } else {
        await loading.dismiss();
        this.showAlert('Erro', 'Nenhum conteúdo encontrado no QR Code.');
      }
    } catch (error) {
      await loading.dismiss();
      this.showAlert('Erro', 'Falha ao escanear o QR Code.');
      console.error(error);
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}