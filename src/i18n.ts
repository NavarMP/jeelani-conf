import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['en', 'ml', 'ar'];

export default getRequestConfig(async ({locale}) => {
  let finalLocale = locale;
  if (!finalLocale) {
    const headersList = await headers();
    finalLocale = headersList.get('x-next-intl-locale') || 'en';
    console.log('x-next-intl-locale header value:', finalLocale);
  }
  finalLocale = locales.includes(finalLocale as any) ? finalLocale : 'en';

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});
