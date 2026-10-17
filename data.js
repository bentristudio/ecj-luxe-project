/* ECJ Luxe — redesign prototype data.
   Thirty featured pieces with restaged photography, taken from ecjluxe.com inventory (in stock, 12 Oct 2026).
   The full catalogue, available and sold, is in catalogue.js.
   Product names are restructured into maison / model / reference the way collectors search. */

window.ECJ = (function () {
  const W = 'watches', J = 'jewelry', H = 'hermes', O = 'home-office';
  // Images resolve through one lookup so the single-file build can swap in embedded copies.
  const src = window.ECJ_SRC = name => (window.ECJ_IMG && window.ECJ_IMG[name.replace(/\.\w+$/, '')]) || 'assets/img/' + (/\.\w+$/.test(name) ? name : name + '.jpg');
  const img = (id, n) => src(id + (n ? '-' + n : ''));

  const products = [
    /* ───────── Watches ───────── */
    {
      id: 75651, cat: W, brand: 'Patek Philippe', model: 'Aquanaut Chronograph',
      line: 'Brown embossed dial, 18k rose gold', ref: '5968R-001', year: 2023,
      price: 155000, cond: 'Pre-owned', set: 'Box & papers', metal: 'Rose gold', size: '42.2mm',
      family: 'Aquanaut', imgs: [img(75651), img(75651, 2), img(75651, 3)], badges: ['Full set'],
      specs: [
        ['Reference', '5968R-001'], ['Year', '2023'], ['Case', '42.2mm, 18k rose gold'],
        ['Movement', 'Automatic, chronograph'], ['Dial', 'Sunburst brown with embossed Aquanaut pattern, rose gold applied numerals, date'],
        ['Bezel', 'Fixed, brushed 18k rose gold'], ['Strap', 'Brown composite, double folding 18k rose gold clasp'],
        ['Box & papers', 'Patek Philippe box and papers'], ['Warranty', 'Two-year ECJ Luxe warranty on the movement']
      ],
      note: 'Kept in excellent condition with no visible scratches or dents on the case, caseback or clasp.'
    },
    {
      id: 75607, cat: W, brand: 'Audemars Piguet', model: 'Royal Oak Tourbillon Chronograph',
      line: 'Factory pavé dial, 18k white gold', ref: '26039BC.ZZ.1205BC.01', year: 2006,
      price: 235000, cond: 'Unworn', set: 'Box & papers', metal: 'White gold', size: '44mm',
      family: 'Royal Oak', imgs: [img(75607), img(75607, 2), img(75607, 3)], badges: ['Rare', 'Unworn'],
      specs: [
        ['Reference', '26039BC.ZZ.1205BC.01'], ['Papers dated', '2006'], ['Case', '44mm, 18k white gold, exhibition caseback'],
        ['Movement', 'Manual wind, tourbillon chronograph'], ['Dial', 'Factory pavé diamonds, tourbillon aperture, mother-of-pearl chronograph registers, openwork hands'],
        ['Bezel', 'Fixed, 18k white gold, diamond set'], ['Bracelet', '18k white gold, fold-over clasp'],
        ['Box & papers', 'Audemars Piguet wooden presentation box with loupe, authenticity and instruction booklets, original papers'],
        ['Warranty', 'Two-year ECJ Luxe warranty']
      ],
      note: 'Kept in unworn condition. No visible signs of wear.'
    },
    {
      id: 75624, cat: W, brand: 'Rolex', model: 'Day-Date 40',
      line: 'Green ombré dial, baguette diamond bezel', ref: '228398TBR', year: 2024,
      price: 210000, cond: 'Pre-owned', set: 'Box & card', metal: 'Yellow gold', size: '40mm',
      family: 'Day-Date', imgs: [img(75624), img(75624, 2), img(75624, 3)], badges: ['Box & card'],
      specs: [
        ['Reference', '228398TBR'], ['Year', '2024'], ['Case', '40mm, 18k yellow gold'],
        ['Movement', 'Automatic'], ['Dial', 'Green ombré, gold Roman numerals, day and date'],
        ['Bezel', 'Factory baguette diamond bezel, 18k yellow gold'], ['Bracelet', '18k yellow gold President, concealed clasp'],
        ['Box & papers', 'Rolex box and Rolex card dated 2024'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ],
      note: 'Rolex box and warranty card dated 2024.'
    },
    {
      id: 75638, cat: W, brand: 'Rolex', model: 'Cosmograph Daytona',
      line: 'Pavé dial, ice blue subdials, platinum', ref: '116576TBR', year: 2024,
      price: 240000, cond: 'Pre-owned', set: 'Box & card', metal: 'Platinum', size: '40mm',
      family: 'Daytona', imgs: [img(75638)], badges: ['Rare'],
      specs: [
        ['Reference', '116576TBR'], ['Year', '2024'], ['Case', '40mm, platinum'], ['Movement', 'Automatic, chronograph'],
        ['Dial', 'Factory pavé diamonds with ice blue subdials'], ['Bezel', 'Factory diamonds set in platinum'],
        ['Bracelet', 'Platinum Oyster'], ['Box & papers', 'Rolex box and Rolex card'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ],
      note: 'Kept in excellent condition; protective film still on the bracelet.'
    },
    {
      id: 75568, cat: W, brand: 'Rolex', model: 'Cosmograph Daytona',
      line: 'Sundust dial, trapeze-cut diamond bezel', ref: '126595TBR', year: 2024,
      price: 179000, cond: 'Unworn', set: 'Box & card', metal: 'Rose gold', size: '40mm',
      family: 'Daytona', imgs: [img(75568)], badges: ['Unworn'],
      specs: [
        ['Reference', '126595TBR'], ['Year', '2024'], ['Case', '40mm, 18k Everose gold'], ['Movement', 'Automatic, chronograph'],
        ['Dial', 'Sundust with factory diamond markers'], ['Bezel', '36 trapeze-cut diamonds in 18k Everose gold'],
        ['Bracelet', '18k Everose Oyster, Oysterlock clasp'], ['Box & papers', 'Rolex box, green hang tag and card dated 2024'],
        ['Warranty', 'Two-year ECJ Luxe warranty']
      ],
      note: 'Unworn; may show minor hairline marks from showcase viewing.'
    },
    {
      id: 74744, cat: W, brand: 'Rolex', model: 'Cosmograph Daytona', nick: 'John Mayer',
      line: 'Green dial, 18k yellow gold', ref: '116508', year: null,
      price: 87500, cond: 'Pre-owned', set: 'Card only', metal: 'Yellow gold', size: '40mm',
      family: 'Daytona', imgs: [img(74744)], badges: [],
      specs: [
        ['Reference', '116508'], ['Year', 'Inquire'], ['Case', '40mm, 18k yellow gold'], ['Movement', 'Automatic, chronograph'],
        ['Dial', 'Green with gold and red accents'], ['Bezel', '18k yellow gold, engraved tachymeter'],
        ['Bracelet', '18k yellow gold Oyster'], ['Box & papers', 'Rolex card, ECJ Luxe presentation box'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 70101, cat: W, brand: 'Rolex', model: 'GMT-Master II',
      line: 'Blue dial, blue & red bezel, 18k white gold', ref: '126719BLRO', year: 2022,
      price: 50000, cond: 'Pre-owned', set: 'Card only', metal: 'White gold', size: '40mm',
      family: 'GMT-Master II', imgs: [img(70101)], badges: [],
      specs: [
        ['Reference', '126719BLRO'], ['Year', '2022'], ['Case', '40mm, 18k white gold'], ['Movement', 'Automatic, GMT'],
        ['Dial', 'Blue, Chromalight markers, date'], ['Bezel', 'Blue and red Cerachrom, bidirectional'],
        ['Bracelet', '18k white gold Oyster'], ['Box & papers', 'Rolex card dated 2022, ECJ Luxe presentation box'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 69022, cat: W, brand: 'Rolex', model: 'Submariner Date', nick: 'Starbucks',
      line: 'Green Cerachrom bezel, black dial', ref: '126610LV', year: null,
      price: 16500, cond: 'Pre-owned', set: 'Papers', metal: 'Steel', size: '41mm',
      family: 'Submariner', imgs: [img(69022)], badges: [],
      specs: [
        ['Reference', '126610LV'], ['Year', 'Inquire'], ['Case', '41mm, Oystersteel'], ['Movement', 'Automatic'],
        ['Dial', 'Black, date at 3 o’clock'], ['Bezel', 'Green Cerachrom, unidirectional'],
        ['Bracelet', 'Oystersteel Oyster'], ['Box & papers', 'Rolex papers'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 75113, cat: W, brand: 'Cartier', model: 'Santos 100 Flying Tourbillon',
      line: 'Limited edition, 18k pink gold', ref: 'W2020019', year: null,
      price: 59900, cond: 'Pre-owned', set: 'Service papers', metal: 'Rose gold', size: '46.5mm',
      family: 'Santos', imgs: [img(75113)], badges: ['Limited edition'],
      specs: [
        ['Reference', 'W2020019'], ['Case', '46.5 × 54.9mm, 18k pink gold, exhibition caseback'], ['Movement', 'Manual wind, flying tourbillon'],
        ['Dial', 'Silver guilloché, black Roman numerals, tourbillon aperture'], ['Strap', 'Black alligator, double folding clasp'],
        ['Included', 'Cartier service papers, six additional Cartier straps, ECJ Luxe presentation box'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ],
      note: 'May show light marks on the case, bezel and clasp from previous wear.'
    },
    {
      id: 75095, cat: W, brand: 'Audemars Piguet', model: 'Royal Oak 37',
      line: 'Green Grande Tapisserie dial, diamond bezel', ref: '15551BC.ZZ.D405CR.01', year: 2025,
      price: 80000, cond: 'Pre-owned', set: 'Box & card', metal: 'White gold', size: '37mm',
      family: 'Royal Oak', imgs: [img(75095)], badges: [],
      specs: [
        ['Reference', '15551BC.ZZ.D405CR.01'], ['Year', '2025'], ['Case', '37mm, 18k white gold, exhibition caseback'], ['Movement', 'Automatic'],
        ['Dial', 'Green Grande Tapisserie, white gold markers and hands, date'], ['Bezel', 'Factory diamond set, 18k white gold'],
        ['Strap', 'Pearly green large-scale alligator'], ['Box & papers', 'Audemars Piguet box and card'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 75284, cat: W, brand: 'Patek Philippe', model: 'Aquanaut Flyback Chronograph',
      line: 'Khaki green dial, 18k white gold', ref: '5968G-010', year: 2022,
      price: 140000, cond: 'Pre-owned', set: 'Box & papers', metal: 'White gold', size: '42.2mm',
      family: 'Aquanaut', imgs: [img(75284)], badges: ['Full set'],
      specs: [
        ['Reference', '5968G-010'], ['Year', '2022'], ['Case', '42.2mm, 18k white gold, exhibition caseback'], ['Movement', 'Self-winding flyback chronograph'],
        ['Dial', 'Khaki green, white gold numerals and hands, date'], ['Strap', 'Khaki green composite, 18k white gold fold-over clasp'],
        ['Water resistance', '30 metres'], ['Box & papers', 'Patek Philippe box and papers dated 2022'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 75461, cat: W, brand: 'Audemars Piguet', model: 'Royal Oak “Super Mini”',
      line: 'Full diamond, emerald markers, 20mm', ref: '67173BC/Z/1115BC/01', year: 2005,
      price: 300000, cond: 'Pre-owned', set: 'Box & papers', metal: 'White gold', size: '20mm',
      family: 'Royal Oak', imgs: [img(75461)], badges: ['Rare'],
      specs: [
        ['Reference', '67173BC/Z/1115BC/01'], ['Papers dated', '2005'], ['Case', '20mm, 18k white gold'], ['Movement', 'Quartz'],
        ['Dial', 'Full pavé diamonds with emerald markers'], ['Diamonds', 'Approx. 48 baguettes (2.95ctw) and 386 round brilliants (2.35ctw), G, IF'],
        ['Bracelet', '18k white gold, push-button deployant'], ['Box & papers', 'Audemars Piguet box and papers'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 75330, cat: W, brand: 'Rolex', model: 'Datejust 36',
      line: 'Mint green dial, fluted bezel, Jubilee', ref: '126234', year: 2026,
      price: 17850, cond: 'Pre-owned', set: 'Card only', metal: 'Steel', size: '36mm',
      family: 'Datejust', imgs: [img(75330)], badges: [],
      specs: [
        ['Reference', '126234'], ['Year', '2026'], ['Case', '36mm, Oystersteel'], ['Movement', 'Automatic'],
        ['Dial', 'Mint green, baton markers, date'], ['Bezel', 'Fluted, 18k white gold'], ['Bracelet', 'Jubilee'],
        ['Box & papers', 'Rolex card dated 2026, ECJ Luxe presentation box'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },
    {
      id: 75268, cat: W, brand: 'Rolex', model: 'Oyster Perpetual 31', nick: 'Celebration',
      line: 'Turquoise Celebration dial', ref: '277200', year: 2024,
      price: 14700, cond: 'Pre-owned', set: 'Card only', metal: 'Steel', size: '31mm',
      family: 'Oyster Perpetual', imgs: [img(75268)], badges: [],
      specs: [
        ['Reference', '277200'], ['Year', '2024'], ['Case', '31mm, Oystersteel'], ['Movement', 'Automatic'],
        ['Dial', 'Turquoise “Celebration” bubble dial'], ['Bracelet', 'Oystersteel Oyster'],
        ['Box & papers', 'Rolex card dated 2024, ECJ Luxe presentation box'], ['Warranty', 'Two-year ECJ Luxe warranty']
      ]
    },

    /* ───────── Jewelry ───────── */
    {
      id: 75450, cat: J, brand: 'Van Cleef & Arpels', model: 'Magic Alhambra long necklace',
      line: 'One mother-of-pearl motif, 18k yellow gold', type: 'Necklace',
      price: 6550, was: 7150, cond: 'Pre-owned', set: 'Box & papers', metal: 'Yellow gold',
      imgs: [img(75450)], badges: ['Reduced'],
      specs: [['Maison', 'Van Cleef & Arpels'], ['Collection', 'Magic Alhambra'], ['Metal', '18k yellow gold'], ['Stone', 'Mother-of-pearl clover motif'], ['Length', '35.43 in, can be doubled'], ['Signed', 'Yes'], ['Included', 'VCA box, pouch and authenticity papers dated 2023']]
    },
    {
      id: 75441, cat: J, brand: 'Jacob & Co.', model: 'Love Lockdown handcuff bracelet',
      line: 'Approx. 16.64ctw diamonds, 18k white gold', type: 'Bracelet',
      price: 48500, was: 75600, cond: 'Pre-owned', set: 'Signed', metal: 'White gold',
      imgs: [img(75441)], badges: ['Reduced'],
      specs: [['Maison', 'Jacob & Co.'], ['Collection', 'Love Lockdown'], ['Metal', '18k white gold'], ['Diamonds', 'Approx. 549 round brilliants, 16.64ctw'], ['Clasp', 'Handcuff with key'], ['Signed', 'Yes']]
    },
    {
      id: 75434, cat: J, brand: 'Cartier', model: 'Juste un Clou ring, full pavé',
      line: '18k rose gold, size 51', type: 'Ring',
      price: 12500, was: 15300, cond: 'Pre-owned', set: 'Signed', metal: 'Rose gold',
      imgs: [img(75434)], badges: ['Rare'],
      specs: [['Maison', 'Cartier'], ['Collection', 'Juste un Clou'], ['Metal', '18k rose gold'], ['Diamonds', 'Approx. 0.60ctw round, VVS'], ['Size', '51 EU / 5¾ US'], ['Original retail', '$15,300']]
    },
    {
      id: 75142, cat: J, brand: 'Van Cleef & Arpels', model: 'Alhambra bracelet, five motifs',
      line: 'Malachite, 18k yellow gold', type: 'Bracelet',
      price: 6150, was: 6400, cond: 'Pre-owned', set: 'Signed', metal: 'Yellow gold',
      imgs: [img(75142)], badges: [],
      specs: [['Maison', 'Van Cleef & Arpels'], ['Collection', 'Vintage Alhambra'], ['Metal', '18k yellow gold'], ['Stones', 'Five malachite motifs'], ['Length', '7.25 in']]
    },
    {
      id: 75512, cat: J, brand: 'Hermès', model: 'Clou d’H drop earrings',
      line: 'Approx. 0.76ctw diamonds, 18k rose gold', type: 'Earrings',
      price: 6500, was: 11200, cond: 'Pre-owned', set: 'Signed', metal: 'Rose gold',
      imgs: [img(75512)], badges: ['Reduced'],
      specs: [['Maison', 'Hermès'], ['Collection', 'Clou d’H'], ['Metal', '18k rose gold'], ['Diamonds', 'Approx. 0.76ctw, E–F, VS–SI'], ['Length', '1.7 in']]
    },
    {
      id: 74573, cat: J, brand: 'Natural diamonds', model: 'Emerald-cut tennis bracelet',
      line: '9.90ctw, mirrored bezel, 18k white gold', type: 'Bracelet',
      price: 37500, was: 48100, cond: 'New', set: '—', metal: 'White gold',
      imgs: [img(74573)], badges: ['Reduced'],
      specs: [['Metal', '18k white gold'], ['Diamonds', 'Approx. 9.90ctw natural emerald cuts, H–J, VS–SI'], ['Setting', 'Bezel and prong, mirrored'], ['Length', '7 in'], ['Clasp', 'Box clasp with safety']]
    },
    {
      id: 72095, cat: J, brand: 'Natural diamonds', model: 'Inside-out hoop earrings',
      line: '10.97ctw round brilliants, 18k white gold', type: 'Earrings',
      price: 58650, cond: 'New', set: '—', metal: 'White gold',
      imgs: [img(72095)], badges: [],
      specs: [['Metal', '18k white gold'], ['Diamonds', '40 round brilliants, 10.97ctw, G–H, VS–SI'], ['Diameter', '1.25 in'], ['Backs', 'Snap back with lever']]
    },
    {
      id: 71981, cat: J, brand: 'Natural diamonds', model: 'East-west emerald-cut ring',
      line: 'GIA 2.03ct, 18k yellow gold', type: 'Ring',
      price: 8720, was: 10900, cond: 'New', set: 'GIA report', metal: 'Yellow gold',
      imgs: [img(71981)], badges: ['GIA'],
      specs: [['Centre stone', '2.03ct emerald cut, L, VS2'], ['Report', 'GIA 5234207851'], ['Accents', '0.26ctw round brilliants, H–I, SI'], ['Total weight', '2.29ctw'], ['Metal', '18k yellow gold'], ['Size', '6.5, can be resized']]
    },
    {
      id: 74540, cat: J, brand: 'Cartier', model: 'Love bracelet',
      line: '18k yellow gold, size 20', type: 'Bracelet',
      price: 7000, was: 7950, cond: 'Pre-owned', set: 'Screwdriver', metal: 'Yellow gold',
      imgs: [img(74540)], badges: [],
      specs: [['Maison', 'Cartier'], ['Collection', 'Love'], ['Metal', '18k yellow gold'], ['Size', '20'], ['Closure', 'Screwdriver, new-style fixed screws']],
      note: 'Light marks from wear that can be polished out.'
    },

    /* ───────── Hermès ───────── */
    {
      id: 75683, cat: H, brand: 'Hermès', model: 'Kelly Pochette',
      line: 'Bleu Tie Swift, palladium hardware', stamp: 'K, 2025',
      price: 25000, cond: 'Unworn', set: 'Box & receipt', metal: 'Palladium', size: '22cm', family: 'Kelly',
      imgs: [img(75683)], badges: ['Unworn'],
      specs: [['Model', 'Kelly Pochette'], ['Leather', 'Veau Swift'], ['Colour', 'Bleu Tie'], ['Hardware', 'Palladium'], ['Size', '22 × 13 × 6cm'], ['Stamp', 'K, 2025'], ['Included', 'Box, dust bag, felt, hardware stickers, receipt']]
    },
    {
      id: 75667, cat: H, brand: 'Hermès', model: 'Birkin 25 Touch',
      line: 'Gris Perle Togo & alligator, gold hardware', stamp: 'U, 2022',
      price: 45000, cond: 'Pre-owned', set: 'Full set, CITES', metal: 'Gold', size: '25cm', family: 'Birkin',
      imgs: [img(75667)], badges: ['Exotic'],
      specs: [['Model', 'Birkin 25 Touch'], ['Leather', 'Togo with Mississippiensis alligator'], ['Colour', 'Gris Perle'], ['Hardware', 'Gold'], ['Size', '25 × 20 × 13cm'], ['Stamp', 'U, 2022'], ['Included', 'Box, dust bag, clochette, lock, two keys, raincoat, CITES']]
    },
    {
      id: 75393, cat: H, brand: 'Hermès', model: 'Birkin 25',
      line: 'Rose Mexico Togo, palladium hardware', stamp: 'G, 2026',
      price: 35000, cond: 'Unworn', set: 'Box & receipt', metal: 'Palladium', size: '25cm', family: 'Birkin',
      imgs: [img(75393)], badges: ['Unworn'],
      specs: [['Model', 'Birkin 25'], ['Leather', 'Togo'], ['Colour', 'Rose Mexico'], ['Hardware', 'Palladium'], ['Size', '25 × 20 × 13cm'], ['Stamp', 'G, 2026'], ['Included', 'Box, dust bag, clochette, lock and key, felt, hardware stickers, copy of receipt']]
    },
    {
      id: 75216, cat: H, brand: 'Hermès', model: 'Kelly 25 Sellier',
      line: 'Mauve Sylvestre Epsom, palladium hardware', stamp: '2026',
      price: 35000, cond: 'Unworn', set: 'Box', metal: 'Palladium', size: '25cm', family: 'Kelly',
      imgs: [img(75216)], badges: ['Unworn'],
      specs: [['Model', 'Kelly 25 Sellier'], ['Leather', 'Epsom'], ['Colour', 'Mauve Sylvestre'], ['Hardware', 'Palladium'], ['Size', '25 × 19 × 9cm'], ['Stamp', '2026'], ['Included', 'Box, clochette, lock and keys, felt, shoulder strap, booklet. No receipt.']]
    },
    {
      id: 67675, cat: H, brand: 'Hermès', model: 'Birkin 25',
      line: 'Noir Togo, gold hardware', stamp: 'G, 2026',
      price: 35000, cond: 'Unworn', set: 'Box & receipt', metal: 'Gold', size: '25cm', family: 'Birkin',
      imgs: [img(67675)], badges: ['Unworn'],
      specs: [['Model', 'Birkin 25'], ['Leather', 'Togo'], ['Colour', 'Noir'], ['Hardware', 'Gold'], ['Size', '25 × 20 × 13cm'], ['Stamp', 'G, 2026'], ['Included', 'Box, dust bags, felt, clochette, keys, padlock, receipt']],
      note: 'Store fresh, unworn, original stickers on the hardware.'
    },

    /* ───────── Home & Office ───────── */
    {
      id: 72983, cat: O, brand: 'Buben & Zorweg', model: 'Spirit 4 watch winder',
      line: 'Chiron Collection, French Racing Blue', type: 'Watch winder',
      price: 10100, cond: 'New', set: '—',
      imgs: [img(72983)], badges: ['Authorized'],
      specs: [['Maison', 'Buben & Zorweg'], ['Capacity', 'Four watches'], ['Finish', 'Atlantic Blue and Bugatti Light Blue duotone'], ['Dimensions', '11 × 11.6 × 10.6 in'], ['Weight', '20 lb']]
    },
    {
      id: 73804, cat: O, brand: 'Berd Vaye', model: 'Passage Through Time',
      line: 'Lucite hourglass sculpture, edition of 999', type: 'Sculpture',
      price: 8000, cond: 'New', set: '—',
      imgs: [img(73804)], badges: ['Limited edition'],
      specs: [['Artist', 'Berd Vaye'], ['Edition', 'Limited to 999'], ['Parts', '1,500–2,000'], ['Dimensions', '15 × 7 × 21 in'], ['Weight', '14 lb']]
    }
  ];

  // on-wrist, on-hand and detail shots from ECJ's own listings
  [75651, 75624, 75638, 69022, 70101, 75268, 75441, 75434, 75142, 74573, 71981, 75393, 67675, 75683, 74540, 75512]
    .forEach(id => { const p = products.find(x => x.id === id); if (p) p.life = src(id + '-life'); });

  // newest first: higher product id = more recently listed
  products.sort((a, b) => b.id - a.id);

  // real counts from the live store, used in navigation
  const counts = {
    total: 280, watches: 71, jewelry: 121, hermes: 12, 'home-office': 28, new: 106,
    brands: {
      'Rolex': 32, 'Audemars Piguet': 14, 'Hermès': 15, 'Cartier': 8, 'Van Cleef & Arpels': 5,
      'Patek Philippe': 4, 'Buben & Zorweg': 9, 'Casio G-Shock': 19, 'Montegrappa': 5, 'Berd Vaye': 5
    },
    rolex: { 'Daytona': 8, 'Datejust': 8, 'Oyster Perpetual': 6, 'Submariner': 3, 'Day-Date': 2, 'Explorer': 2, 'GMT-Master II': 1, 'Yacht-Master': 1 }
  };

  const testimonials = [
    { q: 'I got two of my favorite AP watches from Bobby. They are hard to get and Bobby was able to get them! I recommend ECJ Luxe to any watch lover.', n: 'Nicole Cha' },
    { q: 'Excellent customer service and very responsive. The watch was shipped immediately with overnight shipping. Brand new with warranty and as described.', n: 'Yane Bogoev' },
    { q: 'I was very impressed with the attention and service they provided. The place was very clean, and the atmosphere was calm.', n: 'C. Daniel Arauz' },
    { q: 'Always a pleasure coming into ECJ. Beautiful inventory and endless selections. If you want it, they can get it!', n: 'Philip Mimmo' },
    { q: 'We are from out of town and decided to stop in. Laird was super helpful, patient and took time to explain everything to us.', n: 'Jessica Sequenzia' }
  ];

  return { products, counts, testimonials };
})();
