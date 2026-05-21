'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#005ae0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => createCache({ key: 'mui' }), []);
  const isServerInsertedHTML = React.useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInsertedHTML.current) {
      return null;
    }
    isServerInsertedHTML.current = true;

    const names = Object.keys(cache.inserted);
    if (names.length === 0) {
      return null;
    }

    let styles = '';
    for (const name of names) {
      if (name !== true && cache.inserted[name] !== true) {
        styles += cache.inserted[name];
      }
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}