const affiliates = [
  {
    companyName: "PrizePicks (18+)",
    imageName: "prizepicks",
    affiliateLink: "https://app.prizepicks.com/sign-up?invite_code=WINDAILY",
    type: "fantasy",
  },
  {
    companyName: "Sleeper Picks (18+)",
    imageName: "sleeperFantasy",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "fantasy",
  },
  {
    companyName: "Locker (18+)",
    imageName: "LockerIcon",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "fantasy",
  },
  {
    companyName: "Stake.US Poker (21+)",
    imageName: "Stake",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "poker",
  },
  {
    companyName: "BetMGM Poker (18+)",
    imageName: "BetMGMPoker",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "poker",
  },
  {
    companyName: "Borgata Poker (21+)",
    imageName: "BorgataPoker",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "poker",
  },
  {
    companyName: "Caesars Palace (21+)",
    imageName: "caesarsCasino",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "casino",
  },
  {
    companyName: "FanDuel Casino (21+)",
    imageName: "fanduelCasino",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "casino",
  },
  {
    companyName: "ESPN Casino (21+)",
    imageName: "betespn",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "casino",
  },
  {
    companyName: "Clubs Poker (18+)",
    imageName: "ClubsPoker",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "poker",
  },
  {
    companyName: "Underdog (18+)",
    imageName: "underdog",
    affiliateLink: "https://play.underdogfantasy.com/p-win-daily-sports",
    type: "fantasy",
  },
  {
    companyName: "FanDuel Fantasy (18+)",
    imageName: "fanduel",
    affiliateLink:
      "https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_15755b_56c_&affid=11359&siteid=15755&adid=56&c=",
    type: "fantasy",
  },
  {
    companyName: "DraftKings Casino (18+)",
    imageName: "draftkingsCasino",
    affiliateLink: "https://dksb.sng.link/As9kz/izao?",
    type: "casino",
  },
  {
    companyName: "MyPrize Casino (18+)",
    imageName: "MyPrize",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "casino",
  },
  {
    companyName: "DraftKings Fantasy (18+)",
    imageName: "draftkingsFantasy",
    affiliateLink:
      "https://dkdfs.sng.link/Avkw3/ejal?_dl=draftkings%3A%2F%2Fgateway%3Fs%3D199744492&pcid=357597&psn=2003&pcn=xx&pscn=xx&pcrn=WDS&pscid=DFS&pcrid=xx&wpcid=357597&wpsrc=2003&wpcn=xx&wpscn=xx&wpcrn=WDS&wpscid=DFS&wpcrid=xx&_forward_params=1",
    type: "fantasy",
  },
  {
    companyName: "BetMGM Casino (21+)",
    imageName: "betmgm",
    affiliateLink:
      "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1711375",
    type: "casino",
  },
  {
    companyName: "Betr Picks (21+)",
    imageName: "betrFantasy",
    affiliateLink: "https://www.betr.app/picks-partner?promocode=WINDAILY",
    type: "betting",
  },
  {
    companyName: "Pokerstars (21+)",
    imageName: "pokerstars",
    affiliateLink: "https://star-casino.pxf.io/c/3732491/1574556/14251",
    type: "poker",
  },
  {
    companyName: "ESPN Bet (21+)",
    imageName: "betespn",
    affiliateLink: "https://play.underdogfantasy.com/p-win-daily-sports",
    type: "betting",
  },
  {
    companyName: "Fanatics (21+)",
    imageName: "fanatics",
    affiliateLink: "https://play.underdogfantasy.com/p-win-daily-sports",
    type: "betting",
  },
  {
    companyName: "WSOP (21+)",
    imageName: "WSOP",
    affiliateLink: "https://play.underdogfantasy.com/p-win-daily-sports",
    type: "poker",
  },
];

function createAppItem(affiliate) {
  const appItem = document.createElement("a");
  appItem.className = "app-item";
  appItem.href = affiliate.affiliateLink;
  appItem.target = "_blank";
  appItem.innerHTML = `
        <img src="images/${affiliate.imageName}.png" alt="${affiliate.companyName}">
        <span>${affiliate.companyName}</span>
    `;
  return appItem;
}

function filterAffiliates(type) {
  const appGrid = document.getElementById("app-grid");
  appGrid.innerHTML = "";

  affiliates.forEach((affiliate) => {
    if (type === "all" || affiliate.type === type) {
      appGrid.appendChild(createAppItem(affiliate));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  menu.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
      menu
        .querySelectorAll("button")
        .forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
      filterAffiliates(event.target.dataset.type);
    }
  });

  // Initial load - filter for 'fantasy' by default
  filterAffiliates("fantasy");
});
