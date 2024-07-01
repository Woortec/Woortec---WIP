
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* GTM Head Script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-NXB5KPF3');
              `,
            }}
          />
        </Head>
        <body>
          {/* GTM Body Script */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NXB5KPF3"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
