const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios'); // Not used now, but kept in case you want to switch back to URL

const M3U_CONTENT = `
#EXTM3U
#EXTINF:-1 tvg-id="[CNews.fr](http://CNews.fr)@SD" tvg-logo="https://static.epg.best/fr/CNews.fr.png" group-title="News",CNews
https://viamotionhsi.netplus.ch/live/eds/itele/browser-HLS8/itele.m3u8
#EXTINF:-1 tvg-id="[Franceinfo.fr](http://Franceinfo.fr)@SD" tvg-logo="https://static.epg.best/fr/FranceInfo.fr.png" group-title="News",France Info
https://viamotionhsi.netplus.ch/live/eds/franceinfo/browser-HLS8/franceinfo.m3u8
#EXTINF:-1 tvg-id="[BFMTV.fr](http://BFMTV.fr)@SD" tvg-logo="https://static.epg.best/fr/BFMTV.fr.png" group-title="News",BFM TV
https://viamotionhsi.netplus.ch/live/eds/bfmtv/browser-HLS8/bfmtv.m3u8
#EXTINF:-1 tvg-id="[LCI.fr](http://LCI.fr)@HD" tvg-logo="https://static.epg.best/fr/LCI.fr.png" group-title="News",LCI
https://viamotionhsi.netplus.ch/live/eds/lci/browser-HLS8/lci.m3u8
#EXTINF:-1 tvg-id="[BFMBusiness.fr](http://BFMBusiness.fr)@SD" tvg-logo="https://static.epg.best/fr/BFMBusiness.fr.png" group-title="News",BFM Business
https://viamotionhsi.netplus.ch/live/eds/bfmbusiness/browser-HLS8/bfmbusiness.m3u8
#EXTINF:-1 tvg-id="[Canalplus.fr](http://Canalplus.fr)" tvg-name="Canal+" tvg-logo="https://static.epg.best/fr/CanalPlus.fr.png" group-title="Sports",Canal+
http://drmv3-m6.info:80/play/live.php?mac=00:1A:79:84:1A:60&stream=148474&extension=ts
#EXTINF:-1 tvg-id="LEquipe.fr@SD" tvg-name="L'Equipe" tvg-logo="https://static.epg.best/fr/LEquipe21.fr.png" group-title="Sports",L'Equipe 21
https://viamotionhsi.netplus.ch/live/eds/lequipe21/browser-HLS8/lequipe21.m3u8
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
  id: 'com.grok.m3uaddon',
  version: '1.0.5', // Bumped version for logo revert
  name: 'French TV',
  description: 'Stream channels from an embedded M3U playlist',
  resources: ['catalog', 'meta', 'stream'],
  types: ['channel'],
  catalogs: [
    {
      type: 'channel',
      id: 'tv_channels',
      name: 'French Channels',
    },
  ],
};

const builder = new addonBuilder(manifest);

let channels = [];

// Parse M3U playlist from string
function loadChannels() {
  try {
    const lines = M3U_CONTENT.split('\n');
    let current = {};
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#EXTINF:')) {
        current = parseExtInf(line);
      } else if (line && !line.startsWith('#')) {
        if (current.name) {
          current.url = line.replace(/^</, '').replace(/>$/, ''); // Clean up any < > wrappers if present
          channels.push(current);
          current = {};
        }
      }
    }
    console.log(`Loaded ${channels.length} channels from embedded M3U`);
  } catch (e) {
    console.error('Error parsing M3U:', e);
  }
}

function parseExtInf(line) {
  const obj = {};
  const commaIndex = line.lastIndexOf(','); // Use lastIndexOf to handle multiple commas
  if (commaIndex > -1) {
    obj.name = line.substring(commaIndex + 1).trim();
    const attrsStr = line.substring(8, commaIndex).trim();
    const attrs = attrsStr.match(/(\w+-\w+|\w+)=("[^"]*"|[^ ]*)/g) || [];
    for (let attr of attrs) {
      const [key, value] = attr.split('=');
      obj[key.trim()] = value.replace(/"/g, '').trim().replace(/^</, '').replace(/>$/, ''); // Clean logos/IDs
    }
  }
  obj.tvg_logo = obj['tvg-logo'];
  obj.group = obj['group-title'];
  return obj;
}

// Load channels on startup
loadChannels();

// Catalog handler: List all channels
builder.defineCatalogHandler(async ({ type, id }) => {
  if (type === 'channel' && id === 'tv_channels') {
    return {
      metas: channels.map((ch, index) => ({
        id: `${ch.name.replace(/\s+/g, '-').toLowerCase()}-${index}`, // Add index for unique IDs
        type: 'channel',
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
  const ch = channels.find((ch, index) => `${ch.name.replace(/\s+/g, '-').toLowerCase()}-${index}` === id);
  if (ch) {
    return {
      meta: {
        id,
        type: 'channel',
        name: ch.name,
        poster: ch.tvg_logo,
        genres: ch.group ? [ch.group] : [],
        description: 'TV Channel',
      },
    };
  }
  return { meta: null };
});

// Stream handler: Provide the direct stream URL
builder.defineStreamHandler(async ({ type, id }) => {
  const ch = channels.find((ch, index) => `${ch.name.replace(/\s+/g, '-').toLowerCase()}-${index}` === id);
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

const { serveHTTP } = require('stremio-addon-sdk');
serveHTTP(addonInterface, { port: process.env.PORT || 7000 });
console.log('Addon server running on port 7000');