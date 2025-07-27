import axios from 'axios';

const API_KEY = 'b7f221d2cb134060b2786bc5e8a1a443';
const BASE_URL = 'https://newsapi.org/v2/everything';

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export const getNews = async (query: string = 'forex'): Promise<Article[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        apiKey: API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
