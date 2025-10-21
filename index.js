import { firefox } from 'playwright';
import fetch from 'node-fetch';

const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

const flights = new Map([
  ['SOF → PRG|Lorna Shore|https://www.wizzair.com/en-gb/booking/select-flight/SOF/PRG/2026-01-23/null/1/0/0/null', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTAxLTIzKABqBwgBEgNTT0ZyBwgBEgNQUkdAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
  ['PRG → SOF|Lorna Shore|https://www.wizzair.com/en-gb/booking/select-flight/PRG/SOF/2026-01-26/null/1/0/0/null', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTAxLTI2KABqBwgBEgNQUkdyBwgBEgNTT0ZAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
  ['SOF → PRG|Go to Prague (one ticket bought)|https://www.wizzair.com/en-gb/booking/select-flight/SOF/PRG/2026-02-20/null/1/0/0/null', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTAyLTIwKABqBwgBEgNTT0ZyBwgBEgNQUkdAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
  ['PRG → SOF|Return from Prague (check other dates too)|https://www.wizzair.com/en-gb/booking/select-flight/PRG/SOF/2026-02-23/null/1/0/0/null', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTAyLTIzKABqBwgBEgNQUkdyBwgBEgNTT0ZAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
  ['SOF → VIE|Motionless in White|https://www.ryanair.com/bg/bg/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2026-02-24&dateIn=&isConnectedFlight=false&discount=0&promoCode=&isReturn=false&originIata=SOF&destinationIata=VIE&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2026-02-24&tpEndDate=&tpDiscount=0&tpPromoCode=&tpOriginIata=SOF&tpDestinationIata=VIE', 'https://www.google.com/travel/flights/search?tfs=CBwQAhojEgoyMDI2LTAyLTI0agcIARIDU09GcgwIAxIIL20vMGZocDlAAUgBcAGCAQsI____________AZgBAg']
  ['VIE → SOF|Motionless in White|https://www.ryanair.com/bg/bg/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2026-02-26&dateIn=&isConnectedFlight=false&discount=0&promoCode=&isReturn=false&originIata=VIE&destinationIata=SOF&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2026-02-26&tpEndDate=&tpDiscount=0&tpPromoCode=&tpOriginIata=VIE&tpDestinationIata=SOF', 'https://www.google.com/travel/flights/search?tfs=CBwQAhojEgoyMDI2LTAyLTI2agwIAxIIL20vMGZocDlyBwgBEgNTT0ZAAUgBcAGCAQsI____________AZgBAg']
  ['SOF → WMI|System of a Down|https://www.ryanair.com/bg/bg/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2026-07-17&dateIn=&isConnectedFlight=false&discount=0&promoCode=&isReturn=false&originIata=SOF&destinationIata=WMI&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2026-07-17&tpEndDate=&tpDiscount=0&tpPromoCode=&tpOriginIata=SOF&tpDestinationIata=WMI', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTA3LTE3KABqBwgBEgNTT0ZyBwgBEgNXTUlAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
  ['WMI → SOF|System of a Down|https://www.ryanair.com/bg/bg/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2026-07-20&dateIn=&isConnectedFlight=false&discount=0&promoCode=&isReturn=false&originIata=WMI&destinationIata=SOF&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2026-07-20&tpEndDate=&tpDiscount=0&tpPromoCode=&tpOriginIata=WMI&tpDestinationIata=SOF', 'https://www.google.com/travel/flights/search?tfs=CBwQAhogEgoyMDI2LTA3LTIwKABqBwgBEgNXTUlyBwgBEgNTT0ZAAUgBcAGCAQsI____________AZgBAg&tfu=EgYIACACKAEiAA'],
]);

async function sendTelegramMessage(text) {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' }),
  });
}

(async () => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.google.com/robots.txt');
  await context.addCookies([{
    name: 'SOCS',
    value: 'CAESOAgjEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjUxMDAxLjA3X3AwGgVlbi1VUyACGgYIgIH3xgY',
    path: '/',
    domain: '.google.com',
  }]);

  for (const [route, url] of flights.entries()) {
    await page.goto(url + '&curr=BGN', { waitUntil: 'networkidle' });

    try {
      const priceText = await page.textContent('//div[text()="Cheapest"]/span/span/div/span/span');
      if (priceText) {
        const price = parseInt(priceText.split('\u00A0')[1]);
        const parts = route.split('|');
        console.log(`${parts[0]} (${parts[1]}): ${priceText}`);
        if ((route.includes('WMI') && price < 50) || (route.includes('PRG') && price < 70)) {
          const text = `*⚠️⚠️⚠️ Low Price Alert! ⚠️⚠️⚠️*\n${parts[0]} just *${price} лв.* ✈️\nConcert: *${parts[1]}*\n[CLICK HERE TO BOOK](${parts[2]})`;
          await sendTelegramMessage(text);
        }
      } else {
        throw Error('The span returned an empty string.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  await browser.close();
})();
