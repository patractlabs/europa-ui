import { keyring } from '@polkadot/ui-keyring';
// Copyright 2017-2021 @polkadot/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Signer, SignerResult } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { TypeRegistry } from '@polkadot/types/create';

import { assert, hexToU8a, u8aToHex } from '@polkadot/util';

let id = 0;

export class SingleAccountSigner implements Signer {
  readonly #keyringPair: KeyringPair;

  readonly #registry: Registry;

  readonly #signDelay: number;

  constructor (keyringPair: KeyringPair, signDelay = 0) {
    this.#keyringPair = keyringPair;
    this.#registry = new TypeRegistry();
    this.#signDelay = signDelay;
  }

  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    assert(keyring.decodeAddress(payload.address).toString() === keyring.decodeAddress(this.#keyringPair.address).toString(), 'Signer does not have the keyringPair');

    return new Promise((resolve): void => {
      setTimeout((): void => {
        const data = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
        const signed = data.sign(this.#keyringPair);

        console.log('payload', payload);
        console.log('\nsigned', signed);
        console.log('\nverify', this.#keyringPair.verify(data.toString(), hexToU8a(signed.signature), payload.address));
        
        resolve({
          id: ++id,
          ...signed
        });
      }, this.#signDelay);
    });
  }

  public async signRaw ({ address, data }: SignerPayloadRaw): Promise<SignerResult> {
    assert(keyring.decodeAddress(address).toString() === keyring.decodeAddress(this.#keyringPair.address).toString(), 'Signer does not have the keyringPair');
    
    return new Promise((resolve): void => {
      setTimeout((): void => {
        const signature = u8aToHex(this.#keyringPair.sign(hexToU8a(data)));

        resolve({
          id: ++id,
          signature
        });
      }, this.#signDelay);
    });
  }
}
