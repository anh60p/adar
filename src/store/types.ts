import type { VueDecorator } from 'vue-class-component';
import type { VUEX_TYPES } from '@soramitsu/soraneo-wallet-web';

import type store from '@/store';

type BaseModuleDecorator<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15> = {
  router: VUEX_TYPES.BaseDecorator<T1>;
  web3: VUEX_TYPES.BaseDecorator<T2>;
  assets: VUEX_TYPES.BaseDecorator<T3>;
  settings: VUEX_TYPES.BaseDecorator<T4>;
  swap: VUEX_TYPES.BaseDecorator<T5>;
  referrals: VUEX_TYPES.BaseDecorator<T6>;
  pool: VUEX_TYPES.BaseDecorator<T7>;
  moonpay: VUEX_TYPES.BaseDecorator<T8>;
  bridge: VUEX_TYPES.BaseDecorator<T9>;
  addLiquidity: VUEX_TYPES.BaseDecorator<T10>;
  removeLiquidity: VUEX_TYPES.BaseDecorator<T11>;
  rewards: VUEX_TYPES.BaseDecorator<T12>;
  demeterFarming: VUEX_TYPES.BaseDecorator<T13>;
  routeAssets: VUEX_TYPES.BaseDecorator<T14>;
  soraCard: VUEX_TYPES.BaseDecorator<T15>;
};

export type StateDecorators = BaseModuleDecorator<
  typeof store.state.router,
  typeof store.state.web3,
  typeof store.state.assets,
  typeof store.state.settings,
  typeof store.state.swap,
  typeof store.state.referrals,
  typeof store.state.pool,
  typeof store.state.moonpay,
  typeof store.state.bridge,
  typeof store.state.addLiquidity,
  typeof store.state.removeLiquidity,
  typeof store.state.rewards,
  typeof store.state.demeterFarming,
  typeof store.state.routeAssets,
  typeof store.state.soraCard
> &
  VUEX_TYPES.WalletStateDecorators;

export type GettersDecorators = BaseModuleDecorator<
  typeof store.getters.router,
  typeof store.getters.web3,
  typeof store.getters.assets,
  typeof store.getters.settings,
  typeof store.getters.swap,
  typeof store.getters.referrals,
  typeof store.getters.pool,
  typeof store.getters.moonpay,
  typeof store.getters.bridge,
  typeof store.getters.addLiquidity,
  typeof store.getters.removeLiquidity,
  typeof store.getters.rewards,
  typeof store.getters.demeterFarming,
  typeof store.getters.routeAssets,
  typeof store.getters.soraCard
> &
  VUEX_TYPES.WalletGettersDecorators & { libraryDesignSystem: VueDecorator; libraryTheme: VueDecorator };

export type CommitDecorators = BaseModuleDecorator<
  typeof store.commit.router,
  typeof store.commit.web3,
  typeof store.commit.assets,
  typeof store.commit.settings,
  typeof store.commit.swap,
  typeof store.commit.referrals,
  typeof store.commit.pool,
  typeof store.commit.moonpay,
  typeof store.commit.bridge,
  typeof store.commit.addLiquidity,
  typeof store.commit.removeLiquidity,
  typeof store.commit.rewards,
  typeof store.commit.demeterFarming,
  typeof store.commit.routeAssets,
  typeof store.commit.soraCard
> &
  VUEX_TYPES.WalletCommitDecorators;

export type DispatchDecorators = BaseModuleDecorator<
  typeof store.dispatch.router,
  typeof store.dispatch.web3,
  typeof store.dispatch.assets,
  typeof store.dispatch.settings,
  typeof store.dispatch.swap,
  typeof store.dispatch.referrals,
  typeof store.dispatch.pool,
  typeof store.dispatch.moonpay,
  typeof store.dispatch.bridge,
  typeof store.dispatch.addLiquidity,
  typeof store.dispatch.removeLiquidity,
  typeof store.dispatch.rewards,
  typeof store.dispatch.demeterFarming,
  typeof store.dispatch.routeAssets,
  typeof store.dispatch.soraCard
> &
  VUEX_TYPES.WalletDispatchDecorators;
