import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { NotaFiscalService } from './nota-fiscal.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {
  constructor(
    private notaFiscalService: NotaFiscalService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async scanQRCode() {
    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (permission.granted) {
      document.body.classList.add('scanner-active');
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      document.body.classList.remove('scanner-active');
      if (result.hasContent) {
        const url = result.content;
        this.notaFiscalService.fetchNotaFiscalData(url).subscribe({
          next: (data) =>
            this.router.navigate(['/price-list'], {
              state: { notaData: data },
            }),
          error: (err) => {
            this.showAlert(
              'Erro',
              'Não foi possível carregar os dados da nota.'
            );
            console.error(err);
          },
        });
      }
    } else {
      this.showAlert(
        'Permissão Negada',
        'É necessário permitir o uso da câmera.'
      );
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
