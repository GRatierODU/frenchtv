const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios"); // Not used now, but kept in case you want to switch back to URL

const M3U_CONTENT = `
#EXTM3U
#EXTINF:-1 tvg-id="TF1.fr" tvg-logo="https://static.epg.best/fr/TF1.fr.png" group-title="TNT",TF1
https://viamotionhsi.netplus.ch/live/eds/tf1hd/browser-HLS8/tf1hd.m3u8
#EXTINF:-1 tvg-id="France2.fr" tvg-logo="https://static.epg.best/fr/France2.fr.png" group-title="TNT",France 2
http://69.64.57.208/france2/mono.m3u8
#EXTINF:-1 tvg-id="France3.fr" tvg-logo="https://static.epg.best/fr/France3.fr.png" group-title="TNT",France 3
https://viamotionhsi.netplus.ch/live/eds/france3hd/browser-HLS8/france3hd.m3u8
#EXTINF:-1 tvg-id="France4.fr" tvg-logo="https://static.epg.best/fr/France4.fr.png" group-title="TNT",France 4
https://viamotionhsi.netplus.ch/live/eds/france4hd/browser-HLS8/france4hd.m3u8
#EXTINF:-1 tvg-id="France5.fr" tvg-logo="https://static.epg.best/fr/France5.fr.png" group-title="TNT",France 5
http://69.64.57.208/france5/mono.m3u8
#EXTINF:-1 tvg-id="M6.fr" tvg-logo="https://static.epg.best/fr/M6.fr.png"" group-title="TNT",M6
https://viamotionhsi.netplus.ch/live/eds/m6hd/browser-HLS8/m6hd.m3u8
#EXTINF:-1 tvg-id="Arte.fr" tvg-logo="https://static.epg.best/fr/Arte.fr.png" group-title="TNT",Arte
https://viamotionhsi.netplus.ch/live/eds/artehd/browser-HLS8/artehd.m3u8
#EXTINF:-1 tvg-id="LaChaineParlementaire.fr" tvg-logo="https://static.epg.best/fr/LaChaineParlementaire.fr.png" group-title="TNT",LCP 
https://viamotionhsi.netplus.ch/live/eds/lcp/browser-HLS8/lcp.m3u8
#EXTINF:-1 tvg-id="W9.fr" tvg-logo="https://static.epg.best/fr/W9.fr.png" group-title="TNT",W9
https://viamotionhsi.netplus.ch/live/eds/w9/browser-HLS8/w9.m3u8
#EXTINF:-1  tvg-id="TMC.fr" tvg-logo="https://static.epg.best/fr/TMC.fr.png" group-title="TNT",TMC
https://viamotionhsi.netplus.ch/live/eds/tmc/browser-HLS8/tmc.m3u8
#EXTINF:-1 tvg-id="NT1.fr" tvg-logo="https://static.epg.best/fr/TFX.fr.png" group-title="TNT",TFX
https://viamotionhsi.netplus.ch/live/eds/nt1/browser-HLS8/nt1.m3u8
#EXTINF:-1 tvg-id="BFMTV.fr" tvg-logo="https://static.epg.best/fr/BFMTV.fr.png" group-title="TNT",BFM TV
https://ncdn-live-bfm.pfd.sfr.net/shls/LIVE$BFM_TV/index.m3u8?start=LIVE&end=END
#EXTINF:-1 tvg-id="CNews.fr" tvg-logo="https://static.epg.best/fr/CNews.fr.png" group-title="TNT",CNews
https://raw.githubusercontent.com/schumijo/iptv/main/playlists/canalplus/cnews.m3u8
#EXTINF:-1 tvg-id="LCI.fr" tvg-logo="https://static.epg.best/fr/LCI.fr.png" group-title="TNT",LCI
https://viamotionhsi.netplus.ch/live/eds/lci/browser-HLS8/lci.m3u8
#EXTINF:-1 tvg-id="Franceinfo.fr" tvg-logo="https://static.epg.best/fr/Franceinfo.fr.png" group-title="TNT",France Info
https://raw.githubusercontent.com/schumijo/iptv/main/playlists/francetv/franceinfo.m3u8
#EXTINF:-1 tvg-id="CStar.fr" tvg-logo="https://static.epg.best/fr/CStar.fr.png" group-title="TNT",CStar
https://raw.githubusercontent.com/schumijo/iptv/main/playlists/canalplus/cstar.m3u8
#EXTINF:-1 tvg-id="T18.fr" tvg-logo="https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/france/t18-fr.png" group-title="TNT",T18
https://raw.githubusercontent.com/schumijo/iptv/main/playlists/dailymotion/t18.m3u8
#EXTINF:-1 tvg-id="NOVO19.fr" tvg-logo="https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/france/novo19-fr.png" group-title="TNT",Novo 19
https://viamotionhsi.netplus.ch/live/eds/novo19/browser-HLS8/novo19.m3u8
#EXTINF:-1 tvg-id="TF1SeriesFilms.fr" tvg-logo="https://static.epg.best/fr/TF1SeriesFilms.fr.png" group-title="TNT",TF1 Series Films
https://viamotionhsi.netplus.ch/live/eds/hd1/browser-HLS8/hd1.m3u8
#EXTINF:-1 tvg-id="LEquipe.fr" tvg-logo="https://static.epg.best/fr/LEquipe.fr.png" group-title="TNT",L'Équipe
https://dshn8inoshngm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-gac2i63dmu8b7/LEquipe_FR.m3u8
#EXTINF:-1 tvg-id="6ter.fr" tvg-logo="https://static.epg.best/fr/6ter.fr.png" group-title="TNT",6ter
https://viamotionhsi.netplus.ch/live/eds/6ter/browser-HLS8/6ter.m3u8
#EXTINF:-1 tvg-id="RMCStory.fr" tvg-logo="https://static.epg.best/fr/RMCStory.fr.png" group-title="TNT",RMC Story
https://d15aro46bnpfm8.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-fqkqiax1078up/RMC_Story_FR.m3u8
#EXTINF:-1 tvg-id="RMCDecouverte.fr" tvg-logo="https://static.epg.best/fr/RMCDecouverte.fr.png" group-title="TNT",RMC Découverte
https://d16zzycxcd0m0r.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-hixvx5kymecr9/RMC_Decouverte_FR.m3u8
#EXTINF:-1 tvg-id="Cherie25.fr" tvg-logo="https://static.epg.best/fr/Cherie25.fr.png" group-title="TNT",RMC Life
https://d3dcdjv6dx07iz.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-eaaww2dyp3iih/RMC_Life_FR.m3u8
#EXTINF:-1 tvg-id="RTL9.fr" tvg-logo="https://static.epg.best/fr/RTL9.fr.png" group-title="Mini généralistes",RTL9
https://viamotionhsi.netplus.ch/live/eds/rtl9/browser-HLS8/rtl9.m3u8
#EXTINF:-1 tvg-id="[BeinSport1.fr](http://BeinSport1.fr)" tvg-logo="https://static.epg.best/fr/BeinSports1.fr.png" tvg-name="BeIn Sports 1" group-title="Sports",BeIn Sports 1
http://drmv3-m6.info:80/play/live.php?mac=00:1A:79:84:1A:60&stream=146116&extension=ts
#EXTINF:-1 tvg-id="BeinSpor2..fr" tvg-logo="https://static.epg.best/fr/BeinSports2.fr.png" tvg-name="BeIn Sports 2" group-title="Sports",BeIn Sports 2
http://eagle2024.xyz:80/play/live.php?mac=00:1A:79:C1:E3:9A&stream=149773&extension=ts
#EXTINF:-1 tvg-id="[BeinSport3.fr](http://BeinSport3.fr)" tvg-logo="https://static.epg.best/fr/BeinSports3.fr.png" tvg-name="BeIn Sports 3" group-title="Sports",BeIn Sports 3
http://eagle2024.xyz:80/play/live.php?mac=00:1A:79:C1:E3:9A&stream=250663&extension=ts
#EXTINF:-1 tvg-id="[RMCSport1.fr](http://RMCSport1.fr)" tvg-logo="https://static.epg.best/fr/RMCSport1.fr.png" tvg-name="RMC Sport 1" group-title="Sports",RMC Sport 1
http://eagle2024.xyz:80/play/live.php?mac=00:1A:79:BF:47:35&stream=32835&extension=ts
#EXTINF:-1 tvg-id="[RMCSport2.fr](http://RMCSport2.fr)" tvg-logo="https://static.epg.best/fr/RMCSport2.fr.png" tvg-name="RMC Sport 2" group-title="Sports",RMC Sport 2
http://eagle2024.xyz:80/play/live.php?mac=00:1A:79:BF:47:35&stream=203436&extension=ts
#EXTINF:-1 tvg-id="[InfosportPlus.fr](http://InfosportPlus.fr)" tvg-logo="https://static.epg.best/fr/InfosportPlus.fr.png" tvg-name="Infosport+" group-title="Sports",Infosport+
http://drmv3-m6.info:80/play/live.php?mac=00:1A:79:84:1A:60&stream=274704&extension=ts
`.trim();

const manifest = {
	id: "com.grok.m3uaddon",
	version: "1.0.5", // Bumped version for logo revert
	name: "French TV",
	description: "Stream channels from an embedded M3U playlist",
	resources: ["catalog", "meta", "stream"],
	types: ["channel"],
	catalogs: [
		{
			type: "channel",
			id: "tv_channels",
			name: "French Channels",
		},
	],
};

const builder = new addonBuilder(manifest);

let channels = [];

// Parse M3U playlist from string
function loadChannels() {
	try {
		const lines = M3U_CONTENT.split("\n");
		let current = {};
		for (let line of lines) {
			line = line.trim();
			if (line.startsWith("#EXTINF:")) {
				current = parseExtInf(line);
			} else if (line && !line.startsWith("#")) {
				if (current.name) {
					current.url = line.replace(/^</, "").replace(/>$/, ""); // Clean up any < > wrappers if present
					channels.push(current);
					current = {};
				}
			}
		}
		console.log(`Loaded ${channels.length} channels from embedded M3U`);
	} catch (e) {
		console.error("Error parsing M3U:", e);
	}
}

function parseExtInf(line) {
	const obj = {};
	const commaIndex = line.lastIndexOf(","); // Use lastIndexOf to handle multiple commas
	if (commaIndex > -1) {
		obj.name = line.substring(commaIndex + 1).trim();
		const attrsStr = line.substring(8, commaIndex).trim();
		const attrs = attrsStr.match(/(\w+-\w+|\w+)=("[^"]*"|[^ ]*)/g) || [];
		for (let attr of attrs) {
			const [key, value] = attr.split("=");
			obj[key.trim()] = value.replace(/"/g, "").trim().replace(/^</, "").replace(/>$/, ""); // Clean logos/IDs
		}
	}
	obj.tvg_logo = obj["tvg-logo"];
	obj.group = obj["group-title"];
	return obj;
}

// Load channels on startup
loadChannels();

// Catalog handler: List all channels
builder.defineCatalogHandler(async ({ type, id }) => {
	if (type === "channel" && id === "tv_channels") {
		return {
			metas: channels.map((ch, index) => ({
				id: `${ch.name.replace(/\s+/g, "-").toLowerCase()}-${index}`, // Add index for unique IDs
				type: "channel",
				name: ch.name,
				poster: ch.tvg_logo || undefined, // Use logo if available
				genres: ch.group ? [ch.group] : [],
			})),
		};
	}
	return { metas: [] };
});

// Meta handler: Details for a channel
builder.defineMetaHandler(async ({ type, id }) => {
	const ch = channels.find((ch, index) => `${ch.name.replace(/\s+/g, "-").toLowerCase()}-${index}` === id);
	if (ch) {
		return {
			meta: {
				id,
				type: "channel",
				name: ch.name,
				poster: ch.tvg_logo,
				genres: ch.group ? [ch.group] : [],
				description: "TV Channel",
			},
		};
	}
	return { meta: null };
});

// Stream handler: Provide the direct stream URL
builder.defineStreamHandler(async ({ type, id }) => {
	const ch = channels.find((ch, index) => `${ch.name.replace(/\s+/g, "-").toLowerCase()}-${index}` === id);
	if (ch) {
		return {
			streams: [
				{
					url: ch.url,
					title: ch.name,
				},
			],
		};
	}
	return { streams: [] };
});

const addonInterface = builder.getInterface();

serveHTTP(addonInterface, { port: process.env.PORT || 7000 });
console.log("Addon server running on port 7000");
