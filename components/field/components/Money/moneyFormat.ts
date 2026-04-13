/** Default fraction digits for money input */
export const DefaultPrecisionCont = 2

// Money locale formatting maps
const defaultMoneyIntl = new Intl.NumberFormat('zh-Hans-CN', {
  currency: 'CNY',
  style: 'currency',
})

const enMoneyIntl = {
  style: 'currency',
  currency: 'USD',
}

const ruMoneyIntl = {
  style: 'currency',
  currency: 'RUB',
}

const rsMoneyIntl = {
  style: 'currency',
  currency: 'RSD',
}

const msMoneyIntl = {
  style: 'currency',
  currency: 'MYR',
}

const ptMoneyIntl = {
  style: 'currency',
  currency: 'BRL',
}

const intlMap: Record<string, any> = {
  'default': defaultMoneyIntl,
  'zh-Hans-CN': {
    currency: 'CNY',
    style: 'currency',
  },
  'en-US': enMoneyIntl,
  'ru-RU': ruMoneyIntl,
  'ms-MY': msMoneyIntl,
  'sr-RS': rsMoneyIntl,
  'pt-BR': ptMoneyIntl,
}

/**
 * Format money text by locale.
 */
export function getTextByLocale(locale: string | false, paramsText: number | string | undefined, precision: number, config?: any, moneySymbol: string = ''): string {
  let moneyText: number | string | undefined = paramsText
    ?.toString()
    .replaceAll(',', '')
  if (typeof moneyText === 'string') {
    const parsedNum = Number(moneyText)
    if (Number.isNaN(parsedNum))
      return moneyText
    moneyText = parsedNum
  }
  if (!moneyText && moneyText !== 0)
    return ''

  let supportFormat = false
  try {
    supportFormat
      = locale !== false
        && Intl.NumberFormat.supportedLocalesOf([locale.replace('_', '-')], {
          localeMatcher: 'lookup',
        }).length > 0
  }
  catch {
    // ignore
  }

  try {
    const initNumberFormatter = new Intl.NumberFormat(
      supportFormat && locale !== false
        ? locale?.replace('_', '-') || 'zh-Hans-CN'
        : 'zh-Hans-CN',
      {
        ...(intlMap[(locale as string) || 'zh-Hans-CN'] || defaultMoneyIntl),
        maximumFractionDigits: precision,
        ...config,
      },
    )

    const finalMoneyText = initNumberFormatter.format(moneyText as number)

    // Handle double symbol situation
    const doubleSymbolFormat = (text: string) => {
      const match = text.match(/\d+/)
      if (match) {
        const number = match[0]
        return text.slice(text.indexOf(number))
      }
      return text
    }
    const pureMoneyText = doubleSymbolFormat(finalMoneyText)

    const operatorSymbol = (finalMoneyText || '')[0]

    if (operatorSymbol && ['+', '-'].includes(operatorSymbol)) {
      return `${moneySymbol || ''}${operatorSymbol}${pureMoneyText}`
    }
    return `${moneySymbol || ''}${pureMoneyText}`
  }
  catch {
    return String(moneyText)
  }
}
