const affiliates = [
  {
    companyName: "PrizePicks (18+)",
    imageName: "prizepicks",
    affiliateLink: "https://app.prizepicks.com/sign-up?invite_code=WINDAILY",
    type: "fantasy",
  },
  {
    companyName: "BetRivers Casino (21+)",
    imageName: "ClubsPoker",
    affiliateLink:
      "https://media.mi.betrivers.com/C.ashx?btag=a_11983b_1083c_&affid=1993&siteid=11983&adid=1083&c=",
    type: "casino",
  },

  {
    companyName: "Sleeper Picks - Hedge (18+)",
    imageName: "sleeperFantasy",
    affiliateLink: "https://sleeper.com/promo/HEDGE",
    type: "fantasy",
  },
  {
    companyName: "Sleeper Picks - WD (18+)",
    imageName: "sleeperFantasy",
    affiliateLink: "https://sleeper.com/promo/WINDAILY",
    type: "fantasy",
  },
  {
    companyName: "Locker (18+)",
    imageName: "LockerIcon",
    affiliateLink: "https://locker.bet/",
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
    affiliateLink:
      "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1713673",
    type: "poker",
  },
  {
    companyName: "Borgata Poker (21+)",
    imageName: "BorgataPoker",
    affiliateLink:
      "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1713674",
    type: "poker",
  },
  {
    companyName: "FanDuel Casino (21+)",
    imageName: "fanduelCasino",
    affiliateLink:
      "http://wlfanduel.adsrv.eacdn.com/C.ashx?btag=a_23414b_2436c_&affid=11359&siteid=23414&adid=2436&c=",
    type: "casino",
  },
  {
    companyName: "ESPN Casino (21+)",
    imageName: "espnbet",
    affiliateLink: "",
    type: "casino",
  },
  {
    companyName: "Clubs Poker (18+)",
    imageName: "ClubsPoker",
    affiliateLink: "https://play.clubs.poker/d/?bonusCode=HEDGE",
    type: "poker",
  },
  {
    companyName: "Underdog - Hedge (18+)",
    imageName: "underdog",
    affiliateLink: "https://play.underdogfantasy.com/p-hedge",
    type: "fantasy",
  },
  {
    companyName: "Underdog - WD (18+)",
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
    affiliateLink:
      "https://dksb.sng.link/As9kz/izao?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D264661052%26wpcid%3D211766%26wpcn%3D1000DB%26wpsrc%3DWinDaily%26wpcrid%3D%26wpscn%3D&pcid=211766&pscn=WD2&pcn=1000DB",
    type: "casino",
  },
  {
    companyName: "MyPrize Casino (18+)",
    imageName: "MyPrize",
    affiliateLink: "https://myprize.us/invite/bankroll",
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
    companyName: "BetMGM Casino - Hedge (21+)",
    imageName: "betmgm",
    affiliateLink:
      "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1719270",
    type: "casino",
  },
  {
    companyName: "Caesars Palace (21+)",
    imageName: "caesarsCasino",
    affiliateLink:
      "https://wlwilliamhillus.adsrv.eacdn.com/C.ashx?btag=a_13915b_2654c_&affid=19&siteid=13915&adid=2654&c=",
    type: "casino",
  },
  {
    companyName: "BetMGM Casino - WD (21+)",
    imageName: "betmgm",
    affiliateLink:
      "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1719270",
    type: "casino",
  },
  {
    companyName: "Betr Picks - Hedge (21+)",
    imageName: "betrFantasy",
    affiliateLink: "https://betr.onelink.me/jVGT/Hedge",
    type: "betting",
  },
  {
    companyName: "Betr Picks - WD (21+)",
    imageName: "betrFantasy",
    affiliateLink: "https://www.betr.app/picks-partner?promocode=WINDAILY",
    type: "betting",
  },
  {
    companyName: "Pokerstars (21+)",
    imageName: "pokerstars",
    affiliateLink: "https://star-casino.pxf.io/c/3732491/1130845/14251",
    type: "poker",
  },
  {
    companyName: "ESPN Bet (21+)",
    imageName: "espnbet",
    affiliateLink: "",
    type: "betting",
  },
  {
    companyName: "Fanatics (21+)",
    imageName: "fanatics",
    affiliateLink: "",
    type: "betting",
  },
  {
    companyName: "WSOP (21+)",
    imageName: "WSOP",
    affiliateLink: "",
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
