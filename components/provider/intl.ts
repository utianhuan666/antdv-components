import arEG from './locale/ar_EG'
import caES from './locale/ca_ES'
import csCZ from './locale/cs_CZ'
import deDE from './locale/de_DE'
import enGB from './locale/en_GB'
import enUS from './locale/en_US'
import esES from './locale/es_ES'
import faIR from './locale/fa_IR'
import frFR from './locale/fr_FR'
import heIL from './locale/he_IL'
import hrHR from './locale/hr_HR'
import idID from './locale/id_ID'
import itIT from './locale/it_IT'
import jaJP from './locale/ja_JP'
import koKR from './locale/ko_KR'
import mnMN from './locale/mn_MN'
import msMY from './locale/ms_MY'
import nlNL from './locale/nl_NL'
import plPL from './locale/pl_PL'
import ptBR from './locale/pt_BR'
import roRO from './locale/ro_RO'
import ruRU from './locale/ru_RU'
import skSK from './locale/sk_SK'
import srRS from './locale/sr_RS'
import svSE from './locale/sv_SE'
import thTH from './locale/th_TH'
import trTR from './locale/tr_TR'
import ukUA from './locale/uk_UA'
import uzUZ from './locale/uz_UZ'
import viVN from './locale/vi_VN'
import zhCN from './locale/zh_CN'
import zhHK from './locale/zh_HK'
import zhTW from './locale/zh_TW'

export type IntlType = {
  locale: string
  getMessage: (id: string, defaultMessage: string) => string
}

const zhCNMessages: Record<string, any> = zhCN

const getMessageByPath = (
  messages: Record<string, any>,
  id: string,
): string => {
  const path = id.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: any = messages

  for (const key of path) {
    if (current == null)
      return ''
    current = current[key]
  }

  return typeof current === 'string' ? current : ''
}

export const createIntl = (
  locale: string,
  localeMap: Record<string, any>,
): IntlType => ({
  getMessage: (id: string, defaultMessage: string) => {
    const message = getMessageByPath(localeMap, id)
    if (message)
      return message

    const localeKeyDashed = locale.replace('_', '-')
    if (localeKeyDashed === 'zh-CN')
      return defaultMessage

    return getMessageByPath(zhCNMessages, id) || defaultMessage
  },
  locale,
})

const localeMessages = {
  mn_MN: mnMN,
  ar_EG: arEG,
  zh_CN: zhCN,
  en_US: enUS,
  en_GB: enGB,
  vi_VN: viVN,
  it_IT: itIT,
  ja_JP: jaJP,
  es_ES: esES,
  ca_ES: caES,
  ru_RU: ruRU,
  sr_RS: srRS,
  ms_MY: msMY,
  zh_TW: zhTW,
  zh_HK: zhHK,
  fr_FR: frFR,
  pt_BR: ptBR,
  ko_KR: koKR,
  id_ID: idID,
  de_DE: deDE,
  fa_IR: faIR,
  tr_TR: trTR,
  pl_PL: plPL,
  hr_HR: hrHR,
  th_TH: thTH,
  cs_CZ: csCZ,
  sk_SK: skSK,
  he_IL: heIL,
  uk_UA: ukUA,
  uz_UZ: uzUZ,
  nl_NL: nlNL,
  ro_RO: roRO,
  sv_SE: svSE,
} as const

type LocaleUnderscoreKey = keyof typeof localeMessages
type LocaleDashKey = LocaleUnderscoreKey extends `${infer A}_${infer B}`
  ? `${A}-${B}`
  : never

const toDashKey = <K extends LocaleUnderscoreKey>(key: K) =>
  key.replace('_', '-') as LocaleDashKey

const intlMap = Object.fromEntries(
  (Object.keys(localeMessages) as LocaleUnderscoreKey[]).map(key => [
    toDashKey(key),
    createIntl(key, localeMessages[key]),
  ]),
) as Record<LocaleDashKey, IntlType>

const intlMapKeys = Object.keys(intlMap) as LocaleDashKey[]

export const findIntlKeyByAntdLocaleKey = <T extends string>(
  localeKey?: T,
): T => {
  const input = (localeKey || 'zh-CN').replace('_', '-').toLowerCase()
  const exact = intlMapKeys.find(key => key.toLowerCase() === input)
  if (exact)
    return exact as unknown as T

  const prefix = `${input.split('-')[0]}-`
  const prefixHit = intlMapKeys.find(key =>
    key.toLowerCase().startsWith(prefix),
  )

  return ((prefixHit as string) ?? 'zh-CN') as T
}

const arEGIntl = intlMap['ar-EG']
const caESIntl = intlMap['ca-ES']
const csCZIntl = intlMap['cs-CZ']
const deDEIntl = intlMap['de-DE']
const enGBIntl = intlMap['en-GB']
const enUSIntl = intlMap['en-US']
const esESIntl = intlMap['es-ES']
const faIRIntl = intlMap['fa-IR']
const frFRIntl = intlMap['fr-FR']
const heILIntl = intlMap['he-IL']
const hrHRIntl = intlMap['hr-HR']
const idIDIntl = intlMap['id-ID']
const itITIntl = intlMap['it-IT']
const jaJPIntl = intlMap['ja-JP']
const koKRIntl = intlMap['ko-KR']
const mnMNIntl = intlMap['mn-MN']
const msMYIntl = intlMap['ms-MY']
const nlNLIntl = intlMap['nl-NL']
const plPLIntl = intlMap['pl-PL']
const ptBRIntl = intlMap['pt-BR']
const roROIntl = intlMap['ro-RO']
const ruRUIntl = intlMap['ru-RU']
const skSKIntl = intlMap['sk-SK']
const srRSIntl = intlMap['sr-RS']
const svSEIntl = intlMap['sv-SE']
const thTHIntl = intlMap['th-TH']
const trTRIntl = intlMap['tr-TR']
const ukUAIntl = intlMap['uk-UA']
const uzUZIntl = intlMap['uz-UZ']
const viVNIntl = intlMap['vi-VN']
const zhCNIntl = intlMap['zh-CN']
const zhHKIntl = intlMap['zh-HK']
const zhTWIntl = intlMap['zh-TW']

export {
  arEGIntl,
  caESIntl,
  csCZIntl,
  deDEIntl,
  enGBIntl,
  enUSIntl,
  esESIntl,
  faIRIntl,
  frFRIntl,
  heILIntl,
  hrHRIntl,
  idIDIntl,
  intlMap,
  intlMapKeys,
  itITIntl,
  jaJPIntl,
  koKRIntl,
  mnMNIntl,
  msMYIntl,
  nlNLIntl,
  plPLIntl,
  ptBRIntl,
  roROIntl,
  ruRUIntl,
  skSKIntl,
  srRSIntl,
  svSEIntl,
  thTHIntl,
  trTRIntl,
  ukUAIntl,
  uzUZIntl,
  viVNIntl,
  zhCNIntl,
  zhHKIntl,
  zhTWIntl,
}
