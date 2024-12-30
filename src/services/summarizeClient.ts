import axios from 'axios';

class SummarizeClientService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `http://${process.env.AI_SERVICE}:5000`;
    }

    public async sendTextToFlask(textContent: string): Promise<any> {
        try {

            const response = await axios.post(
                `${this.baseUrl}/summarize`,
                { text: textContent }, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error sending text to Flask API:', error.message);
            throw new Error('Failed to send text to Flask API');
        }
    }
}

export default new SummarizeClientService();
