import Script from 'next/script';

export function PostalyticsPixel() {
	return (
		<Script
			id='postalytics-pixel'
			strategy='afterInteractive'
			dangerouslySetInnerHTML={{
				__html: `
var a;
var rc = new RegExp('_bn_d=([^;]+)');
var rq = new RegExp('_bn_d=([^&#]*)', 'i');
var aq = rq.exec(window.location.href);
if (aq != null) a=aq;
else var ac = rc.exec(document.cookie);
if (ac != null) a=ac;
if (a != null) {
  var _bn_d = a[1];
  (function() {
var pl = document.createElement('script'); pl.type = 'text/javascript'; pl.async = true;
pl.src = ('https:' == document.location.protocol ? 'https://app' : 'http://app') + '.postaladmin.com/plDataEmbed.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(pl, s);
  })();
}
				`,
			}}
		/>
	);
}
