<template>
  <div class="bridge s-flex">
    <s-form class="bridge-form el-form--actions" :show-message="false">
      <s-card
        v-loading="parentLoading"
        class="bridge-content"
        border-radius="medium"
        shadow="always"
        size="big"
        primary
      >
        <generic-page-header class="header--bridge" :title="t('bridge.title')" :tooltip="t('bridge.info')">
          <s-button
            v-if="areNetworksConnected"
            class="el-button--history"
            type="action"
            icon="time-time-history-24"
            :tooltip="t('bridgeHistory.showHistory')"
            tooltip-placement="bottom-end"
            @click="handleViewTransactionsHistory"
          />
          <!-- <s-button
            v-if="areNetworksConnected"
            class="el-button--networks"
            type="action"
            icon="connection-broadcasting-24"
            :tooltip="t('bridge.selectNetwork')"
            tooltip-placement="bottom-end"
            @click="handleChangeNetwork"
          /> -->
        </generic-page-header>
        <s-float-input
          :value="amount"
          :decimals="getDecimals(isSoraToEvm)"
          :delimiters="delimiters"
          :max="MaxInputNumber"
          :disabled="!areNetworksConnected || !isAssetSelected"
          class="s-input--token-value"
          data-test-name="bridgeFrom"
          has-locale-string
          size="medium"
          @input="setAmount"
        >
          <div slot="top" class="input-line">
            <div class="input-title">
              <span class="input-title--uppercase input-title--primary">{{ t('transfers.from') }}</span>
              <span class="input-title--network">{{ getBridgeItemTitle(isSoraToEvm) }}</span>
              <i :class="`s-icon-${isSoraToEvm ? 'sora' : getEvmIcon(evmNetwork)}`" />
            </div>
            <div v-if="isNetworkAConnected && isAssetSelected" class="input-value">
              <span class="input-value--uppercase">{{ t('bridge.balance') }}</span>
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                with-left-shift
                value-class="input-value--primary"
                :value="formatBalance(isSoraToEvm)"
                :fiat-value="firstFieldFiatBalance"
              />
            </div>
          </div>
          <div slot="right" v-if="isNetworkAConnected" class="s-flex el-buttons">
            <s-button
              v-if="isMaxAvailable"
              class="el-button--max s-typography-button--small"
              type="primary"
              alternative
              size="mini"
              border-radius="mini"
              @click="handleMaxValue"
            >
              {{ t('buttons.max') }}
            </s-button>
            <token-select-button
              class="el-button--select-token"
              icon="chevron-down-rounded-16"
              :token="asset"
              @click="openSelectAssetDialog"
            />
          </div>
          <template #bottom>
            <div class="input-line input-line--footer">
              <formatted-amount
                v-if="asset && isSoraToEvm"
                is-fiat-value
                :value="getFiatAmountByString(amount, asset)"
              />
              <token-address v-if="isAssetSelected" v-bind="asset" :external="!isSoraToEvm" class="input-value" />
            </div>
            <div v-if="isNetworkAConnected" class="bridge-item-footer">
              <s-divider type="tertiary" />
              <s-tooltip
                :content="getCopyTooltip(isSoraToEvm)"
                border-radius="mini"
                placement="bottom-end"
                tabindex="-1"
              >
                <span class="bridge-network-address" @click="handleCopyAddress(accountAddressFrom, $event)">
                  {{ formatAddress(accountAddressFrom, 8) }}
                </span>
              </s-tooltip>
              <span>{{ t('bridge.connected') }}</span>
            </div>
            <s-button
              v-else
              class="el-button--connect s-typography-button--large"
              data-test-name="connectPolkadot"
              type="primary"
              @click="isSoraToEvm ? connectInternalWallet() : connectExternalWallet()"
            >
              {{ t('bridge.connectWallet') }}
            </s-button>
          </template>
        </s-float-input>

        <s-button
          class="s-button--switch"
          data-test-name="switchToken"
          type="action"
          icon="arrows-swap-90-24"
          @click="handleSwitchItems"
        />

        <s-float-input
          :value="amount"
          :decimals="getDecimals(!isSoraToEvm)"
          :delimiters="delimiters"
          :max="MaxInputNumber"
          class="s-input--token-value"
          data-test-name="bridgeTo"
          has-locale-string
          size="medium"
          disabled
        >
          <div slot="top" class="input-line">
            <div class="input-title" @click="handleChangeNetwork">
              <span class="input-title--uppercase input-title--primary">{{ t('transfers.to') }}</span>
              <span class="input-title--network">{{ getBridgeItemTitle(!isSoraToEvm) }}</span>
              <i :class="`s-icon-${!isSoraToEvm ? 'sora' : getEvmIcon(evmNetwork)}`" />
            </div>
            <div v-if="isNetworkAConnected && isAssetSelected" class="input-value">
              <span class="input-value--uppercase">{{ t('bridge.balance') }}</span>
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                with-left-shift
                value-class="input-value--primary"
                :value="formatBalance(!isSoraToEvm)"
                :fiat-value="secondFieldFiatBalance"
              />
            </div>
          </div>
          <div slot="right" v-if="isNetworkAConnected && isAssetSelected" class="s-flex el-buttons">
            <token-select-button class="el-button--select-token" :token="asset" />
          </div>
          <template #bottom>
            <div class="input-line input-line--footer">
              <formatted-amount
                v-if="asset && !isSoraToEvm"
                :value="getFiatAmountByString(amount, asset)"
                is-fiat-value
              />
              <token-address v-if="isAssetSelected" v-bind="asset" :external="isSoraToEvm" class="input-value" />
            </div>
            <div v-if="isNetworkBConnected" class="bridge-item-footer">
              <s-divider type="tertiary" />
              <s-tooltip
                :content="getCopyTooltip(!isSoraToEvm)"
                border-radius="mini"
                placement="bottom-end"
                tabindex="-1"
              >
                <span class="bridge-network-address" @click="handleCopyAddress(accountAddressTo, $event)">
                  {{ formatAddress(accountAddressTo, 8) }}
                </span>
              </s-tooltip>
              <span>{{ t('bridge.connected') }}</span>
            </div>
            <s-button
              v-else
              class="el-button--connect s-typography-button--large"
              data-test-name="connectMetamask"
              type="primary"
              @click="!isSoraToEvm ? connectInternalWallet() : connectExternalWallet()"
            >
              {{ t('bridge.connectWallet') }}
            </s-button>
          </template>
        </s-float-input>

        <s-button
          class="el-button--next s-typography-button--large"
          data-test-name="nextButton"
          type="primary"
          :disabled="isConfirmTxDisabled"
          :loading="isConfirmTxLoading"
          @click="handleConfirmTransaction"
        >
          <template v-if="!isValidNetworkType">
            {{ t('bridge.changeNetwork') }}
          </template>
          <template v-else-if="!isAssetSelected">
            {{ t('buttons.chooseAToken') }}
          </template>
          <template v-else-if="!isRegisteredAsset">
            {{ t('bridge.notRegisteredAsset', { assetSymbol }) }}
          </template>
          <template v-else-if="!areNetworksConnected">
            {{ t('bridge.next') }}
          </template>
          <template v-else-if="isZeroAmount">
            {{ t('buttons.enterAmount') }}
          </template>
          <template v-else-if="isInsufficientBalance">
            {{ t('confirmBridgeTransactionDialog.insufficientBalance', { tokenSymbol: assetSymbol }) }}
          </template>
          <template v-else-if="isInsufficientXorForFee">
            {{ t('confirmBridgeTransactionDialog.insufficientBalance', { tokenSymbol: KnownSymbols.XOR }) }}
          </template>
          <template v-else-if="isInsufficientEvmNativeTokenForFee">
            {{ t('confirmBridgeTransactionDialog.insufficientBalance', { tokenSymbol: evmTokenSymbol }) }}
          </template>
          <template v-else>
            {{ t('bridge.next') }}
          </template>
        </s-button>
        <bridge-transaction-details
          v-if="areNetworksConnected && !isZeroAmount && isRegisteredAsset"
          class="info-line-container"
          :info-only="false"
          :evm-token-symbol="evmTokenSymbol"
          :evm-network-fee="evmNetworkFee"
          :sora-network-fee="soraNetworkFee"
        />
      </s-card>
      <select-registered-asset :visible.sync="showSelectTokenDialog" :asset="asset" @select="selectAsset" />
      <!-- <select-network :visible.sync="showSelectNetworkDialog" :value="evmNetwork" :sub-networks="subNetworks" @input="selectNetwork" /> -->
      <confirm-bridge-transaction-dialog
        :visible.sync="showConfirmTransactionDialog"
        :is-valid-network-type="isValidNetworkType"
        :is-sora-to-evm="isSoraToEvm"
        :is-insufficient-balance="isInsufficientBalance"
        :asset="asset"
        :amount="amount"
        :evm-token-symbol="evmTokenSymbol"
        :evm-network="evmNetwork"
        :evm-network-fee="evmNetworkFee"
        :sora-network-fee="soraNetworkFee"
        @confirm="confirmTransaction"
      />
      <network-fee-warning-dialog
        :visible.sync="showWarningFeeDialog"
        :fee="formattedSoraNetworkFee"
        @confirm="confirmNetworkFeeWariningDialog"
      />
    </s-form>
    <div v-if="!areNetworksConnected" class="bridge-footer">{{ t('bridge.connectWallets') }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { components, mixins } from '@soramitsu/soraneo-wallet-web';
import { FPNumber, Operation } from '@sora-substrate/util';
import { KnownSymbols } from '@sora-substrate/util/build/assets/consts';
import type { BridgeHistory } from '@sora-substrate/util';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import BridgeMixin from '@/components/mixins/BridgeMixin';
import NetworkFormatterMixin from '@/components/mixins/NetworkFormatterMixin';
import NetworkFeeDialogMixin from '@/components/mixins/NetworkFeeDialogMixin';
import TokenSelectMixin from '@/components/mixins/TokenSelectMixin';

import { getter, action, mutation, state } from '@/store/decorators';
import router, { lazyComponent } from '@/router';
import { Components, PageNames } from '@/consts';
import {
  isXorAccountAsset,
  hasInsufficientBalance,
  hasInsufficientXorForFee,
  hasInsufficientEvmNativeTokenForFee,
  getMaxValue,
  getAssetBalance,
  asZeroValue,
  isEthereumAddress,
} from '@/utils';
import type { SubNetwork } from '@/utils/ethers-util';
import type { RegisterAssetWithExternalBalance, RegisteredAccountAssetWithDecimals } from '@/store/assets/types';

@Component({
  components: {
    GenericPageHeader: lazyComponent(Components.GenericPageHeader),
    SelectNetwork: lazyComponent(Components.SelectNetwork),
    SelectRegisteredAsset: lazyComponent(Components.SelectRegisteredAsset),
    ConfirmBridgeTransactionDialog: lazyComponent(Components.ConfirmBridgeTransactionDialog),
    NetworkFeeWarningDialog: lazyComponent(Components.NetworkFeeWarningDialog),
    BridgeTransactionDetails: lazyComponent(Components.BridgeTransactionDetails),
    TokenSelectButton: lazyComponent(Components.TokenSelectButton),
    FormattedAmount: components.FormattedAmount,
    FormattedAmountWithFiatValue: components.FormattedAmountWithFiatValue,
    InfoLine: components.InfoLine,
    TokenAddress: components.TokenAddress,
  },
})
export default class Bridge extends Mixins(
  mixins.FormattedAmountMixin,
  mixins.NetworkFeeWarningMixin,
  mixins.CopyAddressMixin,
  BridgeMixin,
  NetworkFormatterMixin,
  NetworkFeeDialogMixin,
  TokenSelectMixin
) {
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;
  readonly KnownSymbols = KnownSymbols;

  @state.bridge.evmNetworkFeeFetching private evmNetworkFeeFetching!: boolean;
  @state.web3.subNetworks subNetworks!: Array<SubNetwork>;
  @state.bridge.amount amount!: string;
  @state.bridge.isSoraToEvm isSoraToEvm!: boolean;
  @state.assets.registeredAssetsFetching registeredAssetsFetching!: boolean;

  @getter.bridge.asset asset!: Nullable<RegisteredAccountAssetWithDecimals>;
  @getter.bridge.isRegisteredAsset isRegisteredAsset!: boolean;
  @getter.settings.nodeIsConnected nodeIsConnected!: boolean;

  @mutation.bridge.setSoraToEvm private setSoraToEvm!: (value: boolean) => void;
  @mutation.bridge.setHistoryId private setHistoryId!: (id?: string) => void;
  @mutation.bridge.setAmount setAmount!: (value: string) => void;

  @action.bridge.setAssetAddress private setAssetAddress!: (value?: string) => Promise<void>;
  @action.bridge.resetBridgeForm private resetBridgeForm!: AsyncFnWithoutArgs;
  @action.bridge.resetBalanceSubscription private resetBalanceSubscription!: AsyncFnWithoutArgs;
  @action.bridge.updateBalanceSubscription private updateBalanceSubscription!: AsyncFnWithoutArgs;
  @action.bridge.getEvmNetworkFee private getEvmNetworkFee!: AsyncFnWithoutArgs;
  @action.bridge.generateHistoryItem private generateHistoryItem!: (history?: any) => Promise<BridgeHistory>;
  @action.wallet.account.addAsset private addAssetToAccountAssets!: (address?: string) => Promise<void>;

  @Watch('nodeIsConnected')
  private updateConnectionSubsriptions(nodeConnected: boolean) {
    if (nodeConnected) {
      this.updateBalanceSubscription();
    } else {
      this.resetBalanceSubscription();
    }
  }

  showSelectTokenDialog = false;
  showSelectNetworkDialog = false;
  showConfirmTransactionDialog = false;

  get assetAddress(): string {
    return this.asset?.address ?? '';
  }

  get firstFieldFiatBalance(): Nullable<string> {
    return this.isSoraToEvm ? this.getFiatBalance(this.asset as AccountAsset) : undefined;
  }

  get secondFieldFiatBalance(): Nullable<string> {
    return !this.isSoraToEvm ? this.getFiatBalance(this.asset as AccountAsset) : undefined;
  }

  get isNetworkAConnected() {
    return this.isSoraToEvm ? this.isSoraAccountConnected : this.isExternalAccountConnected;
  }

  get isNetworkBConnected() {
    return this.isSoraToEvm ? this.isExternalAccountConnected : this.isSoraAccountConnected;
  }

  get isZeroAmount(): boolean {
    return +this.amount === 0;
  }

  get isMaxAvailable(): boolean {
    if (!this.areNetworksConnected || !this.isRegisteredAsset || !this.asset) {
      return false;
    }
    const balance = getAssetBalance(this.asset, { internal: this.isSoraToEvm });
    if (asZeroValue(balance)) {
      return false;
    }
    const decimals = this.asset.decimals;
    const fpBalance = this.getFPNumberFromCodec(balance, decimals);
    const fpAmount = this.getFPNumber(this.amount, decimals);
    // TODO: Check if we have appropriate network fee currency (XOR/ETH) for both networks
    if (isXorAccountAsset(this.asset) && this.isSoraToEvm) {
      const fpFee = this.getFPNumberFromCodec(this.soraNetworkFee, decimals);
      return !FPNumber.eq(fpFee, fpBalance.sub(fpAmount)) && FPNumber.gt(fpBalance, fpFee);
    }
    if (isEthereumAddress(this.asset.externalAddress) && !this.isSoraToEvm) {
      const fpFee = this.getFPNumberFromCodec(this.evmNetworkFee);
      return !FPNumber.eq(fpFee, fpBalance.sub(fpAmount)) && FPNumber.gt(fpBalance, fpFee);
    }
    return !FPNumber.eq(fpBalance, fpAmount);
  }

  get isInsufficientXorForFee(): boolean {
    return hasInsufficientXorForFee(this.xor, this.soraNetworkFee);
  }

  get isInsufficientEvmNativeTokenForFee(): boolean {
    return hasInsufficientEvmNativeTokenForFee(this.evmBalance, this.evmNetworkFee);
  }

  get isInsufficientBalance(): boolean {
    if (!this.asset) return false;

    const fee = this.isSoraToEvm ? this.soraNetworkFee : this.evmNetworkFee;

    return (
      this.isNetworkAConnected &&
      this.isRegisteredAsset &&
      hasInsufficientBalance(this.asset, this.amount, fee, !this.isSoraToEvm)
    );
  }

  get isAssetSelected(): boolean {
    return !!this.asset;
  }

  get assetSymbol(): string {
    return this.asset?.symbol ?? '';
  }

  get formattedSoraNetworkFee(): string {
    return this.formatCodecNumber(this.soraNetworkFee);
  }

  get isConfirmTxDisabled(): boolean {
    return (
      !this.isAssetSelected ||
      !this.isRegisteredAsset ||
      !this.areNetworksConnected ||
      !this.isValidNetworkType ||
      this.isZeroAmount ||
      this.isInsufficientXorForFee ||
      this.isInsufficientEvmNativeTokenForFee ||
      this.isInsufficientBalance
    );
  }

  get isConfirmTxLoading(): boolean {
    return this.isSelectAssetLoading || this.evmNetworkFeeFetching || this.registeredAssetsFetching;
  }

  get isXorSufficientForNextOperation(): boolean {
    if (!this.asset) return false;

    return this.isXorSufficientForNextTx({
      type: this.isSoraToEvm ? Operation.EthBridgeOutgoing : Operation.EthBridgeIncoming,
      isXor: isXorAccountAsset(this.asset),
      amount: this.getFPNumber(this.amount),
    });
  }

  getDecimals(isSora = true): number | undefined {
    return isSora ? this.asset?.decimals : this.asset?.externalDecimals;
  }

  get accountAddressFrom(): string {
    return !this.isSoraToEvm ? this.evmAddress : this.getWalletAddress();
  }

  get accountAddressTo(): string {
    return this.isSoraToEvm ? this.evmAddress : this.getWalletAddress();
  }

  formatBalance(isSora = true): string {
    if (!this.isRegisteredAsset || !this.asset) {
      return '-';
    }
    const balance = getAssetBalance(this.asset, { internal: isSora });
    if (!balance) {
      return '-';
    }
    const decimals = this.getDecimals(isSora);
    return this.formatCodecNumber(balance, decimals);
  }

  async created(): Promise<void> {
    if (this.$route.params.xorToDeposit) {
      await this.selectAsset(this.xor);
      this.setSoraToEvm(false);
      this.setAmount(this.$route.params.xorToDeposit);
    } else {
      // we should reset data only on created, because it's used on another bridge views
      this.resetBridgeForm();
    }
  }

  destroyed(): void {
    this.resetBalanceSubscription();
  }

  getBridgeItemTitle(isSoraNetwork = false): string {
    return this.formatNetwork(isSoraNetwork);
  }

  getCopyTooltip(isSoraNetwork = false): string {
    return this.copyTooltip(isSoraNetwork ? this.t('bridge.soraAddress') : this.t('bridge.ethereumAddress'));
  }

  async handleSwitchItems(): Promise<void> {
    this.setSoraToEvm(!this.isSoraToEvm);
    await this.getEvmNetworkFee();
  }

  handleMaxValue(): void {
    if (this.asset && this.isRegisteredAsset) {
      const fee = this.isSoraToEvm ? this.soraNetworkFee : this.evmNetworkFee;
      const max = getMaxValue(this.asset, fee, !this.isSoraToEvm);
      this.setAmount(max);
    }
  }

  async handleConfirmTransaction(): Promise<void> {
    if (this.allowFeePopup && !this.isXorSufficientForNextOperation) {
      this.openWarningFeeDialog();
      await this.waitOnNextTxFailureConfirmation();
      if (!this.isWarningFeeDialogConfirmed) {
        return;
      }
      this.isWarningFeeDialogConfirmed = false;
    }

    await this.checkConnectionToExternalAccount(() => {
      this.showConfirmTransactionDialog = true;
    });
  }

  handleViewTransactionsHistory(): void {
    router.push({ name: PageNames.BridgeTransactionsHistory });
  }

  handleChangeNetwork(): void {
    this.showSelectNetworkDialog = true;
  }

  openSelectAssetDialog(): void {
    this.showSelectTokenDialog = true;
  }

  async selectNetwork(network: number): Promise<void> {
    this.showSelectNetworkDialog = false;
    this.setEvmNetwork(network);
  }

  async selectAsset(selectedAsset?: RegisterAssetWithExternalBalance): Promise<void> {
    if (!selectedAsset) return;

    await this.withSelectAssetLoading(async () => {
      await this.setAssetAddress(selectedAsset.address);
      await this.getEvmNetworkFee();
    });
  }

  async confirmTransaction(isTransactionConfirmed: boolean): Promise<void> {
    if (!isTransactionConfirmed) return;

    await this.checkConnectionToExternalAccount(async () => {
      // create new history item
      const tx = await this.generateHistoryItem();
      const { assetAddress, type, id } = tx;
      if (type === Operation.EthBridgeOutgoing && assetAddress) {
        const asset = this.accountAssetsAddressTable[assetAddress];
        if (!asset) {
          // Add asset to account assets for balances subscriptions
          await this.addAssetToAccountAssets(assetAddress);
        }
      }
      this.setHistoryId(id);
      router.push({ name: PageNames.BridgeTransaction });
    });
  }
}
</script>

<style lang="scss">
$bridge-input-class: '.el-input';
$bridge-input-color: var(--s-color-base-content-tertiary);

.bridge {
  &-content > .el-card__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $inner-spacing-medium $inner-spacing-medium $inner-spacing-big;
  }
  .bridge-item {
    &--evm {
      .s-input {
        .el-input > input {
          // TODO: remove user select
          cursor: initial;
        }
      }
    }
    > .el-card__body {
      padding: 0;
    }
  }

  &-form {
    @include bridge-container;
  }
}
</style>

<style lang="scss" scoped>
.bridge {
  flex-direction: column;
  align-items: center;
  &-content {
    @include bridge-content;
    @include token-styles;
    @include vertical-divider('s-button--switch', $inner-spacing-medium);
    @include vertical-divider('s-divider-tertiary');
    .el-button--history {
      margin-left: auto;
    }
    @include buttons;
    @include full-width-button('el-button--connect', $inner-spacing-mini);
    @include full-width-button('el-button--next');
    .input-title {
      &--network {
        white-space: nowrap;
      }
      i {
        margin-top: 1px;
        font-size: $s-heading3-caps-font-size;
        @include icon-styles;
      }
    }
  }
  .bridge-item {
    &-footer {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      font-size: var(--s-font-size-mini);
      letter-spacing: var(--s-letter-spacing-small);
      line-height: var(--s-line-height-medium);
      color: var(--s-color-base-content-primary);
    }
    & + .bridge-info {
      margin-top: $basic-spacing * 2;
    }
  }
  .bridge-network-address {
    @include copy-address;
  }
  &-footer {
    display: flex;
    align-items: center;
    margin-top: $inner-spacing-medium;
    font-size: var(--s-font-size-mini);
    line-height: var(--s-line-height-big);
    color: var(--s-color-base-content-secondary);
  }
}
</style>
