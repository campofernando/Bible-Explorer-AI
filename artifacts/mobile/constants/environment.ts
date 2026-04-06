const _rawExpoDomain = process.env.EXPO_PUBLIC_DOMAIN ?? '';

if (!_rawExpoDomain) {
  throw new Error('EXPO_PUBLIC_DOMAIN is not set in your .env file');
}

export const API_BASE = _rawExpoDomain.match(/^https?:\/\//)
  ? _rawExpoDomain
  : `${__DEV__ ? 'http' : 'https'}://${_rawExpoDomain}`;