export interface FeedbackMessage {
  text: string;
  foodPun: string;
  chefQuote: string;
}

export const praiseMessages: FeedbackMessage[] = [
  {
    text: "您真是個無可挑剔的精緻美食鑑定家！",
    foodPun: "這一刻，連海膽都在為您的明智抉擇在冰床上翻滾！",
    chefQuote: "「我會親自為這盤魚子醬點綴上最完美的金箔。」"
  },
  {
    text: "天造地設的完美行程安排！",
    foodPun: "舒芙蕾聽說您要來，已經高興得在烤箱裡膨脹到了極限！",
    chefQuote: "「我的烤箱已經為您預熱到了神聖的 180 度。」"
  },
  {
    text: "這真是一次極致優雅的黃金落筆！",
    foodPun: "那大理石紋路完美的 A5 和牛，已經準備好在鐵板上與齒頰深情一吻。",
    chefQuote: "「這才叫做不留痕跡的雅致。」"
  },
  {
    text: "連挑剔至極的米其林評審都會暗自嫉妒的選擇！",
    foodPun: "松露的香氣正在向四方流淌，彷彿在慶祝熱愛生活的靈魂到訪。",
    chefQuote: "「我們不賣食物，我們只出售令人顫抖的美味記憶。」"
  }
];

export const mockMessages: FeedbackMessage[] = [
  {
    text: "親愛的『不填時間星人』！",
    foodPun: "熱量和幸福感都在空想中蒸發了...",
    chefQuote: "「在量子力學的世界裡，虛無不能果腹。」"
  },
  {
    text: "親愛的『時空穿越大師』！",
    foodPun: "想要來一份精巧的「後悔藥沙拉」嗎？",
    chefQuote: "「我們的熱能烤箱還不具備蟲洞傳輸功能。」"
  },
  {
    text: "尊貴的『自備板凳流浪漢』！",
    foodPun: "沒有桌子，可能需要您用意念漂浮盛裝濃湯的盤子。",
    chefQuote: "「站著享受米其林，是不會打折的唷。」"
  },
  {
    text: "偉大的『物理法則挑戰者』！",
    foodPun: "雖然我很想支持，但擠太滿，等一下沙拉醬會被擠成噴泉！",
    chefQuote: "「雖然座位珍貴，但我們可不提供罐裝沙丁魚的幽閉體驗。」"
  },
  {
    text: "手速比蝸牛還優雅的貴客！",
    foodPun: "真抱歉，香噴噴的位子已經在別人的名下了。",
    chefQuote: "「這次就當作呼吸一下別人餐桌的美味香氣吧，下次早點來！」"
  }
];

export function getRandomPraise(): FeedbackMessage {
  const index = Math.floor(Math.random() * praiseMessages.length);
  return praiseMessages[index];
}

export function getRandomMock(): FeedbackMessage {
  const index = Math.floor(Math.random() * mockMessages.length);
  return mockMessages[index];
}
