import axios from 'axios';
import UserAgent from 'user-agents';

export async function fetchHtml(url) {
  const ua = new UserAgent();
  const res = await axios.get(url, {
    headers: {
      'User-Agent': ua.toString(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 20000,
    validateStatus: s => s >= 200 && s < 400
  });
  return res.data;
}


