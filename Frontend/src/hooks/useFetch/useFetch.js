import { useState, useEffect, useRef } from 'react';

export default function useFetch(url, { method = 'GET', headers = {}, body = null, skip = false, deps = [] } = {}) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef();

    useEffect(() => {
        if (skip || !url) return;
        controllerRef.current = new AbortController();
        const signal = controllerRef.current.signal;
        let mounted = true;

        setLoading(true);
        setError(null);

        (async () => {
            try {
                const res = await fetch(url, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : null,
                    signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const ct = res.headers.get('content-type') || '';
                const payload = ct.includes('application/json') ? await res.json() : await res.text();
                if (mounted) setData(payload);
            } catch (err) {
                if (mounted && err.name !== 'AbortError') setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
            controllerRef.current?.abort();
        };
    }, [url, skip, method, JSON.stringify(body), ...deps]);

    return { data, error, loading, abort: () => controllerRef.current?.abort() };
}