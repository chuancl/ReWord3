
import { md5 } from './md5';
import { IcibaExtendedResponse } from '../types/iciba';

const ICIBA_SECRET = "7ece94d9f9c202b0d3ec55798bf7b6f2";
const CLIENT_ID = "6";
const API_KEY = "1000006";

export const fetchIcibaExtended = async (word: string): Promise<IcibaExtendedResponse | null> => {
    // 1. Use MILLISECONDS timestamp (13 digits) as seen in valid requests
    const timestamp = Date.now().toString();
    
    // 2. Remove uuid parameter (it causes signature verification failure)

    // 3. Construct String to Sign
    // Strict Alphabetical Order: client -> key -> timestamp -> word
    // Structure: param1=value1&param2=value2... + SECRET
    const strToSign = `client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&word=${word}${ICIBA_SECRET}`;
    
    // 4. Generate Signature
    const signature = md5(strToSign);

    // 5. Construct URL
    const url = `https://service.iciba.com/chat/word/v1?client=${CLIENT_ID}&key=${API_KEY}&timestamp=${timestamp}&word=${encodeURIComponent(word)}&signature=${signature}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const json = await response.json();
        
        // Debugging: Log if status is not success
        if (json.status !== 1 && process.env.NODE_ENV === 'development') {
             console.warn("Iciba API returned non-success status:", json);
        }
        
        return json;
    } catch (error) {
        console.warn("Iciba API Network Error", error);
        return null;
    }
}
