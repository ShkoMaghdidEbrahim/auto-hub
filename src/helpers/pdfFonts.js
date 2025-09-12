import jsPDF from 'jspdf';

// Font utility for jsPDF with Kurdish and Arabic support
class PDFFontManager {
  constructor() {
    this.fontsLoaded = false;
    this.loadingPromise = null;
  }

  // Load custom fonts for jsPDF
  async loadFonts() {
    if (this.fontsLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadFontsInternal();
    return this.loadingPromise;
  }

  async _loadFontsInternal() {
    try {
      // Store font data for later use
      this.fontData = {
        vazirmatn: null,
        notoSans: null
      };

      // Load Vazirmatn font (supports Kurdish and Arabic)
      try {
        const vazirmatnResponse = await fetch(
          '/src/assets/fonts/ar-kr/Vazirmatn-VariableFont.ttf'
        );
        if (vazirmatnResponse.ok) {
          const vazirmatnArrayBuffer = await vazirmatnResponse.arrayBuffer();
          this.fontData.vazirmatn =
            this.arrayBufferToBase64(vazirmatnArrayBuffer);
        }
      } catch (error) {
        // Font loading failed, will use fallback
      }

      // Load Noto Sans Arabic font as backup
      try {
        const notoSansResponse = await fetch(
          '/src/assets/fonts/ar-kr/NotoSansArabic-VariableFont.ttf'
        );
        if (notoSansResponse.ok) {
          const notoSansArrayBuffer = await notoSansResponse.arrayBuffer();
          this.fontData.notoSans =
            this.arrayBufferToBase64(notoSansArrayBuffer);
        }
      } catch (error) {
        // Font loading failed, will use fallback
      }

      this.fontsLoaded = true;
    } catch (error) {
      // Fallback to default fonts if custom fonts fail to load
      this.fontsLoaded = true;
    }
  }

  // Helper method to convert ArrayBuffer to base64
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Get the appropriate font based on language
  getFontForLanguage(language) {
    switch (language) {
      case 'ku':
      case 'ar':
        // Use Vazirmatn if available, otherwise fallback to helvetica
        return this.fontData && this.fontData.vazirmatn
          ? 'Vazirmatn'
          : 'helvetica';
      default:
        return 'Vazirmatn';
    }
  }

  // Get the appropriate bold font based on language
  getBoldFontForLanguage(language) {
    switch (language) {
      case 'ku':
      case 'ar':
        // Use Vazirmatn-Bold if available, otherwise fallback to helvetica
        return this.fontData && this.fontData.vazirmatn
          ? 'Vazirmatn-Bold'
          : 'helvetica';
      default:
        return 'helvetica';
    }
  }

  // Configure jsPDF document with appropriate fonts
  configureDocument(doc, language = 'en') {
    const font = this.getFontForLanguage(language);
    const boldFont = this.getBoldFontForLanguage(language);

    // Set default font
    doc.setFont(font);

    return { font, boldFont };
  }

  // Create a new jsPDF document with font support
  async createDocument(
    orientation = 'l',
    unit = 'mm',
    format = 'a4',
    language = 'en'
  ) {
    await this.loadFonts();

    const doc = new jsPDF(orientation, unit, format);

    // Add fonts to this specific document if available
    if (this.fontData && this.fontData.vazirmatn) {
      try {
        doc.addFileToVFS('Vazirmatn-Regular.ttf', this.fontData.vazirmatn);
        doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
        doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn-Bold', 'bold');
      } catch (error) {
        // Font addition failed, will use fallback
      }
    }

    if (this.fontData && this.fontData.notoSans) {
      try {
        doc.addFileToVFS('NotoSansArabic-Regular.ttf', this.fontData.notoSans);
        doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
        doc.addFont(
          'NotoSansArabic-Regular.ttf',
          'NotoSansArabic-Bold',
          'bold'
        );
      } catch (error) {
        // Font addition failed, will use fallback
      }
    }

    const { font, boldFont } = this.configureDocument(doc, language);

    return { doc, font, boldFont };
  }
}

// Create singleton instance
const pdfFontManager = new PDFFontManager();

export default pdfFontManager;

// Helper function to get current language
export const getCurrentLanguage = () => {
  return localStorage.getItem('i18nextLng') || 'en';
};

// Helper function to check if text contains RTL characters
export const isRTLLanguage = (language) => {
  return ['ku', 'ar', 'fa', 'he', 'ur'].includes(language);
};
