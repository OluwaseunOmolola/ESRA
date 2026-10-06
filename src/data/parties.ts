/**
 * Parties offered wherever the form asks the respondent to pick one or more.
 * Keys are the values stored in the submission; values are the abbreviations
 * shown next to them in the UI.
 */
export const PARTY_ABBREVIATIONS: Record<string, string> = {
  Accord: 'A',
  'Action Alliance': 'AA',
  'Action Democratic Party': 'ADP',
  'Action Peoples Party': 'APP',
  'African Action Congress': 'AAC',
  'African Democratic Congress': 'ADC',
  'All Progressives Congress': 'APC',
  'All Progressives Grand Alliance': 'APGA',
  'Allied Peoples Movement': 'APM',
  'Boot Party': 'BP',
  'Democratic Leadership Alliance': 'DLA',
  'Labour Party': 'LP',
  'National Democratic Party': 'NDP',
  'National Rescue Movement': 'NRM',
  'New Nigeria Peoples Party': 'NNPP',
  'Nigeria Democratic Congress': 'NDC',
  'Peoples Democratic Party': 'PDP',
  'Peoples Redemption Party': 'PRP',
  'Social Democratic Party': 'SDP',
  'Young Progressives Party': 'YPP',
  'Youth Party': 'YP',
  'Zenith Labour Party': 'ZLP',
}

/** Label for an option; unchanged unless the value is a known party */
export function optionLabel(value: string): string {
  const abbreviation = PARTY_ABBREVIATIONS[value]
  return abbreviation ? `${value} (${abbreviation})` : value
}
