// pages/_app.tsx
import * as React from 'react';
import type { AppProps } from 'next/app';
import Layout from './layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
