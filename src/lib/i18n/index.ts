import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      common: {
        app_name: "Mahjong Points",
        app_tracker: "Mahjong Tracker",
      },
      setup: {
        title: "New Game Setup",
        players: "Players",
        base_score: "Base Score",
        start_game: "Start Game",
        initial_dealer: "Initial Dealer",
        player_placeholder: "Player {{index}}",
        order_disclaimer: "(Please arrange in order)",
      },
      game: {
        round: "ROUND",
        dealer: "DEALER",
        end_round: "End Round",
        end_session: "End Session",
        history: "Round History",
        round_results: "Round Results",
        who_won: "Who won?",
        multiplier: "Multiplier",
        field_points: "Points (Gold/Flower/Kong)",
        cancel: "Cancel",
        calculate: "Calculate",
        wins: "wins",
        lian: "Streak",
        confirm_end:
          "Are you sure you want to end the session? All current scores will be lost.",
        select_winner: "Please select a winner",
        edit_round: "Edit Round",
        save: "Save Changes",
        delete: "Delete Round",
        confirm_delete:
          "Are you sure you want to delete this round? This will recalculate all subsequent rounds.",
        score_change: "Score Change",
        field_points_short: "Field Points",
        total_score: "Total Score",
        no_history: "No history yet",
        edit_disclaimer:
          "Only the most recent round can be edited to ensure point consistency.",
        win_rate: "Win Rate",
        rename_player: "Rename Player",
        new_name_label: "New Name",
      },
      pwa: {
        update_available: "New version available!",
        update_now: "Update Now",
        install_app: "Install App",
      },
    },
  },
  zh: {
    translation: {
      common: {
        app_name: "麻将计分",
        app_tracker: "麻将记分器",
      },
      setup: {
        title: "新游戏设置",
        players: "玩家",
        base_score: "底分",
        start_game: "开始游戏",
        initial_dealer: "初始庄家",
        player_placeholder: "玩家 {{index}}",
        order_disclaimer: "(请按顺序排列)",
      },
      game: {
        round: "回合",
        dealer: "庄家",
        end_round: "结束回合",
        end_session: "结束游戏",
        history: "历史纪录",
        round_results: "回合结果",
        who_won: "谁赢了?",
        multiplier: "倍率",
        field_points: "分数 (金/花/杠)",
        cancel: "取消",
        calculate: "计算",
        wins: "获胜",
        lian: "连庄",
        confirm_end: "您确定要结束游戏吗？所有当前分数都将丢失。",
        select_winner: "请选择获胜者",
        edit_round: "编辑回合",
        save: "保存更改",
        delete: "删除回合",
        confirm_delete: "您确定要删除此回合吗？这将重新计算所有后续回合。",
        score_change: "分数变化",
        field_points_short: "场上分数",
        total_score: "总得分",
        no_history: "暂无历史记录",
        edit_disclaimer: "为了确保分数一致性，只能编辑最新的一回合。",
        win_rate: "胜率",
        rename_player: "重命名玩家",
        new_name_label: "新名字",
      },
      pwa: {
        update_available: "有新版本可用！",
        update_now: "立即更新",
        install_app: "安装应用",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ["en", "zh"],
    fallbackLng: "en",
    detection: {
      order: [
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
      ],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
