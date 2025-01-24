import axios from 'axios';

export const autocomplete = async (search: string): Promise<{ phrase: string }[] | null> => {
  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    dnt: '1',
    priority: 'u=1, i',
    referer: 'https://duckduckgo.com/',
    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
  };

  const res = await axios.get(`https://duckduckgo.com/ac/?q=${search}&kl=wt-wt`, { headers });
  return res.data as { phrase: string }[] | null;
};
