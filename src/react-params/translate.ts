import type { UseTranslationResponse } from 'react-i18next';

import { useTranslation as useTranslationBase, withTranslation } from 'react-i18next';

export function useTranslation (): UseTranslationResponse<'react-params'> {
  return useTranslationBase('react-params');
}

export default withTranslation(['react-params']);
