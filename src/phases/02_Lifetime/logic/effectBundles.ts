/**
 * 效果封包（Effect Bundles）
 *
 * 預定義的複合效果，牌卡可直接引用封包名稱而非逐一列出數值。
 * 數值平衡調整時只需改這一處。
 *
 * 用法（在 cards.ts 中）：
 *   import { BUNDLES } from '../logic/effectBundles'
 *   effects: BUNDLES.burnout
 */

import type { CardOptionEffect } from '../data/cards'

export const BUNDLES = {
  /** 身心俱疲：生命力/穩定大幅下降，壓抑熵上升 */
  burnout: {
    core: { Vitality: -15, Stability: -10 },
    soulToxins: { Entropy: 8 },
  },

  /** 出賣靈魂：積極/感性崩潰，偽善飆升，但金錢暴漲，靈魂完整度大幅扣除 */
  sellOut: {
    core: { Drive: -20, Emotion: -10 },
    soulToxins: { Hypocrisy: 15 },
    surface: { Money: 30 },
    soulIntegrity: -25,
  },

  /** 冷血決策：冷血度上升，但聲望和理性小增 */
  coldBlood: {
    soulToxins: { Ruthlessness: 10 },
    core: { Logic: 5 },
    surface: { Reputation: 3 },
  },

  /** 逃避現實：壓抑熵大增，各項裏值小幅下降 */
  escapism: {
    soulToxins: { Entropy: 12 },
    core: { Stability: -5, Drive: -5 },
  },

  /** 良知抉擇：靈魂完整度小幅回升，但表層代價 */
  conscience: {
    soulIntegrity: 5,
    surface: { Reputation: -3, Money: -5 },
    core: { Stability: 8 },
  },

  /** 社會面具：偽善度上升，但聲望爆升（短期爽快，長期代價） */
  socialMask: {
    soulToxins: { Hypocrisy: 10 },
    surface: { Reputation: 15 },
    soulIntegrity: -10,
  },
} as const satisfies Record<string, CardOptionEffect>
