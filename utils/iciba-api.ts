
import { md5 } from './md5';
import { IcibaExtendedResponse } from '../types/iciba';

const ICIBA_SECRET = "7ece94d9f9c202b0d3ec55798bf7b6f2";
const CLIENT_ID = "6";
const API_KEY = "1000006";

export const fetchIcibaExtended = async (word: string): Promise<IcibaExtendedResponse | null> => {
    const timestamp = Date.now().toString();
    // Signature Construction: query params + secret
    const strToSign = `client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&word=${word}${ICIBA_SECRET}`;
    const signature = md5(strToSign);

    const url = `https://service.iciba.com/chat/word/v1?client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&word=${encodeURIComponent(word)}&signature=${signature}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const json = await response.json();
        return json;
    } catch (error) {
        console.warn("Iciba API Error", error);
        return null;
    }
}
