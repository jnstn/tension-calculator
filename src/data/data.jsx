/* --------------------
Babolat Rackets
-------------------- */

// Babolat Pure Aero
import pureAero2023 from "./babolat/2023-babolat-pure_aero.json";

// Babolat Pure Drive
import pureDrive2021 from "./babolat/2021-babolat-pure_drive.json";
import pureDrive2024 from "./babolat/2024-babolat-pure_drive.json";
import pureDrive2025 from "./babolat/2025-babolat-pure_drive.json";

// Babolat Pure Strike
import pureStrike2024 from "./babolat/2024-babolat-pure_strike.json";

/* --------------------
Dunlop Rackets
-------------------- */

// CX Series
import cx2024 from "./dunlop/2024-dunlop-cx.json";

// FX Series
import fx2023 from "./dunlop/2023-dunlop-fx.json";

// SX Series
import sx2025 from "./dunlop/2025-dunlop-sx.json";

/* --------------------
HEAD Rackets
-------------------- */

// HEAD Boom
import boom2024 from "./head/2024-head-boom.json";

// HEAD Extreme
import extreme2020 from "./head/2020-head-extreme.json";
import extreme2024 from "./head/2024-head-extreme.json";

// HEAD Gravity
import gravity2023 from "./head/2023-head-gravity.json";
import gravity2025 from "./head/2025-head-gravity.json";

// HEAD Instinct
import instinct2025 from "./head/2025-head-instinct.json";

// HEAD Prestige
import prestige2023 from "./head/2023-head-prestige.json";

// HEAD Radical
import radical2021 from "./head/2021-head-radical.json";
import radical2023 from "./head/2023-head-radical.json";
import radical2025 from "./head/2025-head-radical.json";

// HEAD Speed
import speed2024 from "./head/2024-head-speed.json";

/* --------------------
Tecnifibre Rackets
-------------------- */

// TF40
import tf402024 from "./tecnifibre/2024-tecnifibre-tf40.json";

// TFight
import tfight2025 from "./tecnifibre/2025-tecnifibre-tfight.json";

/* --------------------
Wilson Rackets
-------------------- */

// Wilson Blade
import blade2024 from "./wilson/2024-wilson-blade.json";

// Wilson Burn
import burn2023 from "./wilson/2023-wilson-burn.json";

// Wilson Clash
import clash2022 from "./wilson/2022-wilson-clash.json";
import clash2025 from "./wilson/2025-wilson-clash.json";

// Wilson Pro Labs
import proLabs2022 from "./wilson/2022-wilson-pro_labs.json";
import proLabs2023 from "./wilson/2023-wilson-pro_labs.json";
import proLabs2024 from "./wilson/2024-wilson-pro_labs.json";

// Wilson Pro Staff
import proStaff2023 from "./wilson/2023-wilson-pro_staff.json";

// Wilson RF
import rf2024 from "./wilson/2024-wilson-rf.json";

// Wilson Shift
import shift2023 from "./wilson/2023-wilson-shift.json";

// Wilson Ultra
import ultra2022 from "./wilson/2022-wilson-ultra.json";

/* --------------------
Yonex Rackets
-------------------- */

// Yonex Ezone
import ezone2022 from "./yonex/2022-yonex-ezone.json";
import ezone2025 from "./yonex/2025-yonex-ezone.json";

// Yonex Percept
import percept2023 from "./yonex/2023-yonex-percept.json";

// Yonex Vcore
import vcore2021 from "./yonex/2021-yonex-vcore.json";
import vcore2024 from "./yonex/2024-yonex-vcore.json";

/* --------------------
Export Data
-------------------- */

export const racketsData = [
  // Babolat
  ...pureAero2023.rackets,
  ...pureDrive2021.rackets,
  ...pureDrive2024.rackets,
  ...pureDrive2025.rackets,
  ...pureStrike2024.rackets,
  // Dunlop
  ...cx2024.rackets,
  ...fx2023.rackets,
  ...sx2025.rackets,
  // HEAD
  ...boom2024.rackets,
  ...extreme2020.rackets,
  ...extreme2024.rackets,
  ...gravity2023.rackets,
  ...gravity2025.rackets,
  ...instinct2025.rackets,
  ...prestige2023.rackets,
  ...radical2021.rackets,
  ...radical2023.rackets,
  ...radical2025.rackets,
  ...speed2024.rackets,
  // Tecnifibre
  ...tf402024.rackets,
  ...tfight2025.rackets,
  // Wilson
  ...blade2024.rackets,
  ...burn2023.rackets,
  ...clash2022.rackets,
  ...clash2025.rackets,
  ...proLabs2022.rackets,
  ...proLabs2023.rackets,
  ...proLabs2024.rackets,
  ...proStaff2023.rackets,
  ...rf2024.rackets,
  ...shift2023.rackets,
  ...ultra2022.rackets,
  // Yonex
  ...ezone2022.rackets,
  ...ezone2025.rackets,
  ...percept2023.rackets,
  ...vcore2021.rackets,
  ...vcore2024.rackets,
];
