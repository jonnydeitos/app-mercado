import { Component } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { Preferences } from '@capacitor/preferences'; // Substitui Storage por Preferences
import { NotaFiscalService } from '../services/nota-fiscal.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
    private router: Router,
    private alertController: AlertController
  ) {}

  async scanQRCode() {
    try {
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        this.showAlert('Erro', 'Escaneamento não suportado neste dispositivo.');
        return;
      }

      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        this.showAlert(
          'Permissão Negada',
          'É necessário permitir o uso da câmera.'
        );
        return;
      }

      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (barcodes.length > 0) {
        const rawUrl = barcodes[0].rawValue;
        const adjustedUrl = rawUrl.replace(
          'www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
          'dfe-portal.svrs.rs.gov.br/Dfe/QrCodeNFce'
        );
        console.log('URL ajustada:', adjustedUrl);
        this.notaFiscalService.fetchNotaFiscalData(adjustedUrl).subscribe({
          next: async (data) => {
            console.log('Dados salvos:', data);
            const existingNotas = await this.getNotas();
            existingNotas.push(data);
            await Preferences.set({
              key: 'notas',
              value: JSON.stringify(existingNotas),
            });
            this.router.navigate(['/price-list']);
          },
          error: (err) => {
            console.error('Erro ao buscar dados:', err);
            this.showAlert(
              'Erro',
              'Não foi possível carregar os dados da nota.'
            );
          },
        });
      } else {
        this.showAlert('Erro', 'Nenhum QR code encontrado.');
      }
    } catch (error) {
      this.showAlert('Erro', 'Falha ao escanear o QR code.');
      console.error(error);
    }
  }

  async getNotas(): Promise<any[]> {
    const { value } = await Preferences.get({ key: 'notas' }); // Ajustado para Preferences
    return value ? JSON.parse(value) : [];
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
