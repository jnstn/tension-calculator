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
HEAD Rackets
-------------------- */

// Wilson Blade
import blade2024 from "./wilson/2024-wilson-blade.json";

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
Export Data
-------------------- */

export const racketsData = [
  // Babolat
  ...pureAero2023.rackets,
  ...pureDrive2021.rackets,
  ...pureDrive2024.rackets,
  ...pureDrive2025.rackets,
  ...pureStrike2024.rackets,
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
  // Wilson
  ...blade2024.rackets,
  ...clash2022.rackets,
  ...clash2025.rackets,
  ...proLabs2022.rackets,
  ...proLabs2023.rackets,
  ...proLabs2024.rackets,
  ...proStaff2023.rackets,
  ...rf2024.rackets,
  ...shift2023.rackets,
  ...ultra2022.rackets,
];
