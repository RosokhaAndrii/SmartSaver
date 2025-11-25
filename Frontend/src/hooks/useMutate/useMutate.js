import { useState } from 'react';

export default function useMutate(baseUrl = '') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  async function mutate(endpoint, { method = 'POST', body = null, headers = {} } = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(baseUrl + endpoint, {
        method, 
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : null,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : await res.text();
      setData(payload);
      return payload;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { mutate, data, loading, error };
}