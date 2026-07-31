// Complete catalog of Indonesian Banks and E-Wallets categorized according to Bank Indonesia & SNAP standards
export const BANK_AND_WALLET_CATALOG = {
  cash: [
    { code: 'CASH', name: 'Tunai', type: 'cash', color: '#10b981' }
  ],
  bank: [
    { code: 'BCA', name: 'Bank BCA', type: 'bank', color: '#00569E' },
    { code: 'MANDIRI', name: 'Bank Mandiri', type: 'bank', color: '#002D62' },
    { code: 'BRI', name: 'Bank BRI', type: 'bank', color: '#00529C' },
    { code: 'BNI', name: 'Bank BNI', type: 'bank', color: '#F15A24' },
    { code: 'BSI', name: 'Bank Syariah Indonesia (BSI)', type: 'bank', color: '#00A39D' },
    { code: 'CIMB', name: 'Bank CIMB Niaga', type: 'bank', color: '#7E1416' },
    { code: 'PERMATA', name: 'Bank Permata', type: 'bank', color: '#00833E' },
    { code: 'DANAMON', name: 'Bank Danamon', type: 'bank', color: '#E85116' },
    { code: 'BTN', name: 'Bank BTN', type: 'bank', color: '#004793' },
    { code: 'JAGO', name: 'Bank Jago', type: 'bank', color: '#FF7D00' },
    { code: 'SEABANK', name: 'SeaBank', type: 'bank', color: '#FF5722' },
    { code: 'BLU', name: 'blu by BCA Digital', type: 'bank', color: '#00B2FF' },
    { code: 'ALLO', name: 'Allo Bank', type: 'bank', color: '#622181' },
    { code: 'JENIUS', name: 'Jenius / BTPN', type: 'bank', color: '#00A3E0' },
    { code: 'NEO', name: 'Bank Neo Commerce', type: 'bank', color: '#FFB800' }
  ],
  ewallet: [
    { code: 'GOPAY', name: 'GoPay', type: 'ewallet', color: '#00AED6' },
    { code: 'OVO', name: 'OVO', type: 'ewallet', color: '#4C2A86' },
    { code: 'DANA', name: 'DANA', type: 'ewallet', color: '#118EEA' },
    { code: 'SHOPEEPAY', name: 'ShopeePay', type: 'ewallet', color: '#EE4D2D' },
    { code: 'LINKAJA', name: 'LinkAja', type: 'ewallet', color: '#ED1C24' },
    { code: 'ASTRAPAY', name: 'AstraPay', type: 'ewallet', color: '#005CA9' },
    { code: 'SAKUKU', name: 'Sakuku (BCA)', type: 'ewallet', color: '#00569E' },
    { code: 'ISAKU', name: 'i.saku (Indomaret)', type: 'ewallet', color: '#004B93' }
  ]
};

export const ALL_ACCOUNTS_LIST = [
  ...BANK_AND_WALLET_CATALOG.cash,
  ...BANK_AND_WALLET_CATALOG.bank,
  ...BANK_AND_WALLET_CATALOG.ewallet
];
