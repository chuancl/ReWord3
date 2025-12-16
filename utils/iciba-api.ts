
import { md5 } from './md5';
import { IcibaExtendedResponse } from '../types/iciba';

const ICIBA_SECRET = "7ece94d9f9c202b0d3ec55798bf7b6f2";
const CLIENT_ID = "6";
const API_KEY = "1000006";

export const fetchIcibaExtended = async (word: string): Promise<IcibaExtendedResponse | null> => {
    // 1. Use seconds instead of milliseconds for timestamp (PHP convention)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 2. Add uuid parameter (required for signature in some endpoints)
    const uuid = "0"; 

    // 3. Construct String to Sign
    // STRICT Order: client -> key -> timestamp -> uuid -> word
    const strToSign = `client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&uuid=${uuid}&word=${word}${ICIBA_SECRET}`;
    
    // 4. Generate Signature
    const signature = md5(strToSign);

    // 5. Construct URL
    const url = `https://service.iciba.com/chat/word/v1?client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&uuid=${uuid}&word=${encodeURIComponent(word)}&signature=${signature}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const json = await response.json();
        
        // Debugging: Log if status is not standard success (usually 1)
        if (json.status !== 1 && json.status !== 200 && process.env.NODE_ENV === 'development') {
             console.warn("Iciba API returned non-success status:", json);
        }
        
        return json;
    } catch (error) {
        console.warn("Iciba API Network Error", error);
        return null;
    }
}
