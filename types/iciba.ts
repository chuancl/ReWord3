
export interface IcibaExtendedResponse {
    message: string;
    status: number;
    data?: {
        aiSearchWordPronunciationVo?: {
            pronunciation?: string; // 发音技巧
            videoUrl?: string;
        };
        wordEtymaVo?: {
            assist?: string; // 单词助记
            explosion?: string;
        };
        // 可以在此扩展更多字段
    };
}
