import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      try {
        // Configurar a barra de status
        await StatusBar.setStyle({ style: Style.Light }); // Ícones claros para combinar com o gradiente escuro do header
        await StatusBar.setBackgroundColor({ color: '#6e8efb' }); // Cor de fundo da barra de status (mesma cor inicial do gradiente)
        await StatusBar.setOverlaysWebView({ overlay: false }); // Impede que a barra de status sobreponha o conteúdo
      } catch (error) {
        console.error('Erro ao configurar a barra de status:', error);
      }
    });
  }
}
