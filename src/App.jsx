import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import { Card, CardContent } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";

const mockRacketsAPI = async () => [
  {
    brand: "Head",
    product: "Prestige",
    variant: "Tour",
    version: "2023",
    headSize: 95,
    pattern: { mains: 16, crosses: 19 },
    swingweight: 330,
    stiffness: 62,
    beam: [22],
  },
  {
    brand: "Head",
    product: "Extreme",
    variant: "Pro",
    version: "2024",
    headSize: 98,
    pattern: { mains: 16, crosses: 19 },
    swingweight: 322,
    stiffness: 64,
    beam: [22, 23, 21],
  },
];

const estimateDynamicTension = (mains, crosses, specs) => {
  if (!specs) return null;
  const avgTension = (Number(mains) + Number(crosses)) / 2;
  const headFactor = 95 / specs.headSize;
  const patternKey = `${specs.pattern.mains}x${specs.pattern.crosses}`;
  const patternOpenness = {
    "18x20": 0.0,
    "18x19": 0.3,
    "16x20": 0.6,
    "16x19": 1.0,
    "16x18": 1.5,
  };
  const patternFactor = 1 - (patternOpenness[patternKey] ?? 0.5) * 0.1;
  const stiffnessFactor = 1 + (specs.stiffness - 60) * 0.01;
  const dt = avgTension * headFactor * patternFactor * stiffnessFactor;
  return Math.round(dt * 10) / 10;
};

const findTensionForDT = (targetDT, ratio, specs) => {
  let low = 10,
    high = 80,
    bestTension = null;
  while (high - low > 0.05) {
    const mid = (low + high) / 2;
    const dt = estimateDynamicTension(mid, mid * ratio, specs);
    if (dt > targetDT) high = mid;
    else low = mid;
    bestTension = mid;
  }
  return Math.round(bestTension * 10) / 10;
};

const convertWeight = (value, from, to) => {
  if (from === to) return value;
  return from === "lbs"
    ? value / 2.20462 // lbs ➝ kg
    : value * 2.20462; // kg ➝ lbs
};

export default function TensionCalculator() {
  const [rackets, setRackets] = useState([]);
  const [oldSelection, setOldSelection] = useState({});
  const [newSelection, setNewSelection] = useState({});
  const [unit, setUnit] = useState("lbs");
  const [oldMainsLbs, setOldMainsLbs] = useState(46);
  const [oldCrossesLbs, setOldCrossesLbs] = useState(46);
  const [suggestedMains, setSuggestedMains] = useState(null);
  const [suggestedCrosses, setSuggestedCrosses] = useState(null);
  const [oldDT, setOldDT] = useState(null);
  const [newDT, setNewDT] = useState(null);
  const [tensionProfile, setTensionProfile] = useState("balanced");

  const profileRatios = {
    balanced: 1.0,
    spin: 0.95,
    control: 1.05,
  };

  useEffect(() => {
    mockRacketsAPI().then(setRackets);
  }, []);

  useEffect(() => {
    const applyTheme = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(mediaQuery);
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, []);

  const handleUnitSwitch = (val) => {
    const newUnit = val ? "kg" : "lbs";
    setUnit(newUnit);
  };

  const displayTension = (lbs) => {
    const val = unit === "kg" ? lbs / 2.20462 : lbs;
    return Math.round(val * 10) / 10; // 1 decimal place
  };

  const parseTensionInput = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return unit === "kg" ? num * 2.20462 : num; // Always return lbs
  };

  const getRacketBySelection = (sel) =>
    rackets.find(
      (r) =>
        r.brand === sel.brand &&
        r.product === sel.product &&
        r.variant === sel.variant &&
        r.version === sel.version
    );

  useEffect(() => {
    const oldSpecs = getRacketBySelection(oldSelection);
    const newSpecs = getRacketBySelection(newSelection);
    if (oldSpecs)
      setOldDT(estimateDynamicTension(oldMainsLbs, oldCrossesLbs, oldSpecs));
    if (oldSpecs && newSpecs) {
      const targetDT = estimateDynamicTension(
        oldMainsLbs,
        oldCrossesLbs,
        oldSpecs
      );
      const ratio = profileRatios[tensionProfile];
      const mains = findTensionForDT(targetDT, ratio, newSpecs);
      const crosses = Math.round(mains * ratio * 10) / 10;
      setSuggestedMains(mains);
      setSuggestedCrosses(crosses);
      setNewDT(estimateDynamicTension(mains, crosses, newSpecs));
    }
  }, [
    oldSelection,
    newSelection,
    oldMainsLbs,
    oldCrossesLbs,
    tensionProfile,
    rackets,
  ]);

  const uniqueValues = (key, filter = {}) => [
    ...new Set(
      rackets
        .filter((r) =>
          Object.entries(filter).every(([k, v]) => !v || r[k] === v)
        )
        .map((r) => r[key])
    ),
  ];

  const renderRacketSelectors = (selection, setSelection) => (
    <>
      <Label>Brand</Label>
      <Select onValueChange={(v) => setSelection({ brand: v })}>
        <SelectTrigger className="dark:bg-gray-700">
          {selection.brand || "Select brand"}
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-700">
          {uniqueValues("brand").map((val) => (
            <SelectItem className="dark:bg-gray-700" key={val} value={val}>
              {val}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selection.brand && (
        <>
          <Label>Product</Label>
          <Select
            onValueChange={(v) => setSelection((s) => ({ ...s, product: v }))}
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.product || "Select product"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("product", { brand: selection.brand }).map(
                (val) => (
                  <SelectItem
                    className="dark:bg-gray-700"
                    key={val}
                    value={val}
                  >
                    {val}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </>
      )}
      {selection.product && (
        <>
          <Label>Version</Label>
          <Select
            onValueChange={(v) => setSelection((s) => ({ ...s, version: v }))}
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.version || "Select version"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("version", {
                brand: selection.brand,
                product: selection.product,
              }).map((val) => (
                <SelectItem className="dark:bg-gray-700" key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      {selection.version && (
        <>
          <Label>Variant</Label>
          <Select
            onValueChange={(v) => setSelection((s) => ({ ...s, variant: v }))}
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.variant || "Select variant"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("variant", {
                brand: selection.brand,
                product: selection.product,
                version: selection.version,
              }).map((val) => (
                <SelectItem className="dark:bg-gray-700" key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );

  const renderLabeledInput = (
    value,
    onChange,
    readOnly = false,
    showUnit = true
  ) => (
    <div className="relative">
      <Input
        type="number"
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        onChange={onChange}
        className={`w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white ${
          readOnly
            ? "pointer-events-none font-semibold text-center focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent"
            : ""
        }`}
      />
      {showUnit && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
          {unit}
        </div>
      )}
    </div>
  );

  return (
    <div className="pl-6 pr-6 max-w-6xl mx-auto text-black dark:text-white min-h-screen transition-colors duration-300">
      <div className="text-center mt-12 mb-12">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Tennis String Tension Calculator
        </h1>
        <p className="text-gray-600 mt-3 dark:text-gray-400 text-sm">
          Match stringbed feel between rackets by preserving dynamic tension
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardContent className="p-4 grid gap-6">
            <Label className="font-bold text-lg">Old Racket</Label>

            {/* Group 1: Racket Selection */}
            <div className="grid gap-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Racket
              </Label>
              {renderRacketSelectors(oldSelection, setOldSelection)}
            </div>

            {/* Group 2: Tensions & DT */}
            <div className="grid gap-4 border-t border-gray-300 dark:border-gray-600 pt-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Tensions
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Old Mains Tension</Label>
                  {renderLabeledInput(displayTension(oldMainsLbs), (e) =>
                    setOldMainsLbs(parseTensionInput(e.target.value))
                  )}
                </div>
                <div>
                  <Label>Old Crosses Tension</Label>
                  {renderLabeledInput(displayTension(oldCrossesLbs), (e) =>
                    setOldCrossesLbs(parseTensionInput(e.target.value))
                  )}
                </div>
              </div>
              <div>
                <Label>Estimated DT</Label>
                {renderLabeledInput(oldDT ?? "", null, true, false)}
              </div>
            </div>

            {/* Group 3: Display Settings */}
            <div className="grid gap-2 border-t border-gray-300 dark:border-gray-600 pt-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Display Units
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={unit === "kg"}
                  onCheckedChange={handleUnitSwitch}
                  className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-primary transition-colors"
                />
                <Label>
                  {unit === "lbs" ? "Pounds (lbs)" : "Kilograms (kg)"}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardContent className="p-4 grid gap-6">
            <Label className="font-bold text-lg">New Racket</Label>

            {/* Group 1: Racket Selection */}
            <div className="grid gap-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Racket
              </Label>
              {renderRacketSelectors(newSelection, setNewSelection)}
            </div>

            {/* Group 2: Suggested Tensions & DT */}
            <div className="grid gap-4 border-t border-gray-300 dark:border-gray-600 pt-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Suggested Tensions
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Suggested Mains Tension</Label>
                  {renderLabeledInput(
                    displayTension(suggestedMains ?? ""),
                    null,
                    true
                  )}
                </div>
                <div>
                  <Label>Suggested Crosses Tension</Label>
                  {renderLabeledInput(
                    displayTension(suggestedCrosses ?? ""),
                    null,
                    true
                  )}
                </div>
              </div>
              <div>
                <Label>Estimated DT</Label>
                {renderLabeledInput(newDT ?? "", null, true, false)}
              </div>
            </div>

            {/* Group 3: Tension Profile */}
            <div className="grid gap-2 border-t border-gray-300 dark:border-gray-600 pt-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Tension Profile
              </Label>
              <RadioGroup
                value={tensionProfile}
                onValueChange={setTensionProfile}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced">Balanced</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="spin" id="spin" />
                  <Label htmlFor="spin">Spin</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="control" id="control" />
                  <Label htmlFor="control">Control</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
