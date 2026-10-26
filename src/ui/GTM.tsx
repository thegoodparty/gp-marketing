import Script from 'next/script';

/**
 * Loads the GTM container, which owns the GA4 tags for this site. Gated on the
 * served hostname for the reason in `~/lib/crawlableHosts`: preview deploys
 * report `VERCEL_ENV=production` while being served on a `*.vercel.app` host, so
 * an env check would still send preview and local sessions into the one GA4
 * property as real traffic. The check is inlined in the script because this
 * component renders on the server and only the browser knows the hostname;
 * keep it in step with `isGoodPartyProductionHost`.
 */
export function GTM() {
	return (
		<>
			{/* Google Tag Manager */}
			<Script
				id='gtag'
				strategy='afterInteractive'
				dangerouslySetInnerHTML={{
					__html: `
        if (window.location.hostname === 'goodparty.org' || window.location.hostname.endsWith('.goodparty.org')) {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}

        gtag('consent', 'default', {
          'ad_storage': "granted",
          'analytics_storage': "granted"
        });

        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M53W2ZV');
        }
        `,
				}}
			/>

			<noscript>
				<iframe
					src={`https://www.googletagmanager.com/ns.html?id=GTM-M53W2ZV`}
					height='0'
					width='0'
					style={{ display: 'none', visibility: 'hidden' }}
				></iframe>
			</noscript>
			{/* End Google Tag Manager */}
		</>
	);
}
