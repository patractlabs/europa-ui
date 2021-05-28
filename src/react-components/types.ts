// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WithTranslation } from 'react-i18next';

export interface BareProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export type BitLength = 8 | 16 | 32 | 64 | 128 | 256;

export type I18nProps = BareProps & WithTranslation;
