export const STORAGE_ZONES = Array.from({ length: 7 }, (_, index) => `Zone ${String.fromCharCode(65 + index)}`);
export const STORAGE_RACKS = [
  ...Array.from({ length: 24 }, (_, index) => `Rack ${String.fromCharCode(65 + index)}`),
  'Almehra',
  'Cabinet'
];

// Reference locations from the workbook's "Total Line Items" store map.
export const CATEGORY_LOCATION_SUGGESTIONS = {
  'IT Spares': { zone: 'Zone A', racks: 'A & B' },
  'Electronic Gadgets': { zone: 'Zone A', racks: 'Almerah & Cabinet' },
  'Network Related Materials': { zone: 'Zone A', racks: 'C & D' },
  'Toner Cartridge for Printers': { zone: 'Zone A', racks: 'D' },
  'Stationery Items': { zone: 'Zone B', racks: 'E & F' },
  'Printed Stationery Items': { zone: 'Zone B', racks: 'E & F' },
  'Electrical Spare Parts': { zone: 'Zone C', racks: 'G & H' },
  'Plumbing Spare Parts': { zone: 'Zone C', racks: 'H' },
  'Furniture & Fitting Spare Parts': { zone: 'Zone C', racks: 'H' },
  'Gift Articles': { zone: 'Zone D', racks: 'I & J' },
  'Reference Books & Project Reports': { zone: 'Zone D', racks: 'K' },
  'Event Related Materials': { zone: 'Zone D', racks: 'L' },
  'Health & First Aid Equipments': { zone: 'Zone E', racks: 'N' },
  'Office Equipments': { zone: 'Zone F', racks: 'P' },
  'Housekeeping Materials': { zone: 'Zone G', racks: 'Q' },
  'Cutlery Set': { zone: '', racks: 'R' }
};

export function buildStorageLocation(zone = '', rack = '', details = '') {
  return [zone, rack, details.trim()].filter(Boolean).join(' - ');
}

export function parseStorageLocation(location = '') {
  const result = { zone: '', rack: '', details: '' };
  if (!location || typeof location !== 'string') return result;

  let remaining = location.trim();
  const zone = STORAGE_ZONES.find(value => new RegExp(`\\b${value}\\b`, 'i').test(remaining));
  if (zone) {
    result.zone = zone;
    remaining = remaining.replace(new RegExp(`\\b${zone}\\b`, 'i'), '');
  }

  const specialRack = STORAGE_RACKS.slice(-2).find(value => new RegExp(`\\b${value}\\b`, 'i').test(remaining));
  const workbookAlmerah = /\bAlmerah\b/i.test(remaining);
  const letterRack = remaining.match(/\b(?:Rack\s*)?([A-X])(?:\s*[-/]\s*(\w+))?\b/i);
  if (specialRack) {
    result.rack = specialRack;
    remaining = remaining.replace(new RegExp(`\\b${specialRack}\\b`, 'i'), '');
  } else if (workbookAlmerah) {
    result.rack = 'Almehra';
    remaining = remaining.replace(/\bAlmerah\b/i, '');
  } else if (letterRack) {
    result.rack = `Rack ${letterRack[1].toUpperCase()}`;
    remaining = remaining.replace(letterRack[0], letterRack[2] || '');
  }

  result.details = remaining.replace(/^[\s\-,:]+|[\s\-,:]+$/g, '').trim();
  if (/^(general storage|general bay)$/i.test(result.details)) result.details = '';
  return result;
}
