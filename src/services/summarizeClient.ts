import axios from 'axios';
import CircuitBreaker from 'opossum';

class SummarizeClientService {
    private baseUrl: string;
    private breaker: CircuitBreaker;

    constructor() {
        this.baseUrl = `http://${process.env.AI_SERVICE || 'localhost'}:5000`;

        // Circuit Breaker ayarlarını yapıyoruz
        this.breaker = new CircuitBreaker(this.sendTextToFlask.bind(this), {
            timeout: 5000,            // Maksimum bekleme süresi (5 saniye)
            errorThresholdPercentage: 50,  // Hata oranı %50'yi geçerse devre kesilir
            resetTimeout: 10000       // 10 saniye sonra devreyi tekrar açmayı dener
        });

        // Fallback mekanizması (Servis çalışmazsa dönecek yanıt)
        this.breaker.fallback(() => {
            return { summary: 'Service is temporarily unavailable. Please try again later.' };
        });
    }

    private async sendTextToFlask(textContent: string): Promise<any> {
        const response = await axios.post(
            `${this.baseUrl}/summarize`,
            { text: textContent },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    }

    public async getSummary(textContent: string): Promise<any> {
        return this.breaker.fire(textContent);
    }
}

export default new SummarizeClientService();
