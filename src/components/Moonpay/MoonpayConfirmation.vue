<template>
  <confirm-bridge-transaction-dialog
    :visible.sync="visibility"
    :confirm-button-text="t('moonpay.buttons.transfer')"
    v-bind="{
      ...modalData,
      ...$attrs,
    }"
    v-on="{
      confirm: startBridgeForMoonpayTransaction,
      ...$listeners,
    }"
  >
    <template #title>
      <moonpay-logo :theme="libraryTheme" />
    </template>
    <template #content-title>
      <div class="moonpay-confirmation__title">
        {{ t('moonpay.confirmations.txReady') }}
      </div>
    </template>
  </confirm-bridge-transaction-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import MoonpayBridgeInitMixin from '@/components/Moonpay/MoonpayBridgeInitMixin';
import MoonpayLogo from '@/components/logo/Moonpay.vue';

import { lazyComponent } from '@/router';
import { Components } from '@/consts';
import { getter, state } from '@/store/decorators';

import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import type { Whitelist } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    MoonpayLogo,
    ConfirmBridgeTransactionDialog: lazyComponent(Components.ConfirmBridgeTransactionDialog),
  },
})
export default class MoonpayConfirmation extends Mixins(MoonpayBridgeInitMixin) {
  @state.moonpay.confirmationVisibility private confirmationVisibility!: boolean;

  @getter.wallet.account.whitelist private whitelist!: Whitelist;
  @getter.web3.isValidNetworkType private isValidNetworkType!: boolean;
  @getter.libraryTheme libraryTheme!: Theme;

  get visibility(): boolean {
    return this.confirmationVisibility;
  }

  set visibility(flag: boolean) {
    this.setConfirmationVisibility(flag);
  }

  get modalData(): any {
    if (!this.bridgeTransactionData) return {};

    return {
      isSoraToEvm: false,
      amount: this.bridgeTransactionData.amount,
      asset: this.whitelist[this.bridgeTransactionData.assetAddress as string],
      evmNetwork: this.bridgeTransactionData.externalNetwork,
      evmNetworkFee: this.bridgeTransactionData.ethereumNetworkFee,
      soraNetworkFee: this.bridgeTransactionData.soraNetworkFee,
      isValidNetworkType: this.isValidNetworkType,
    };
  }
}
</script>

<style lang="scss" scoped>
.moonpay-confirmation {
  &__title {
    font-size: var(--s-font-size-large);
    font-weight: 300;
    letter-spacing: var(--s-letter-spacing-mini);
    line-height: var(--s-line-height-small);
    margin-bottom: $inner-spacing-big;
  }
}
</style>
