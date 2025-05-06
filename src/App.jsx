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
import { racketsData } from "./data/data";

/**
 * estimateDynamicTension()
 * Calculates the 'dynamic tension' (DT) of a racket given string tensions
 * and its specifications, relative to a reference head size.
 *
 * @param {number|string} mains - Main string tension (lbs)
 * @param {number|string} crosses - Cross string tension (lbs)
 * @param {object} specs - Racket specifications
 * @param {number} referenceHeadSize - Head size of the 'old' racket for scaling
 * @returns {number|null} Estimated DT rounded to one decimal, or null if missing data
 */
const estimateDynamicTension = (mains, crosses, specs, referenceHeadSize) => {
  if (!specs || !referenceHeadSize) return null;

  // Convert input tensions to numbers and compute average
  const avgTension = (Number(mains) + Number(crosses)) / 2;

  // Compute head size factor relative to the reference racket
  const headFactor = Math.sqrt(referenceHeadSize / specs.headSize);

  // Map string pattern to an openness factor, then invert for feel scaling
  const patternKey = `${specs.pattern.mains}x${specs.pattern.crosses}`;
  const patternOpenness = {
    "18x20": 0.0,
    "18x19": 0.3,
    "16x20": 0.6,
    "16x19": 1.0,
    "16x18": 1.5,
  };
  const patternFactor = 1 - (patternOpenness[patternKey] ?? 0.5) * 0.1;

  // Scale for frame stiffness (RA), using 60 as a baseline
  const stiffnessFactor = 1 + (specs.stiffness - 60) * 0.003;

  // Calibration factor for DT estimation (ERT 300 alignment)
  const calibrationFactor = 0.748;

  // Final DT calculation combining all factors
  const dt =
    avgTension *
    headFactor *
    patternFactor *
    stiffnessFactor *
    calibrationFactor;
  return dt;
};

/**
 * findTensionForDT()
 * Uses a binary search to find the mains tension on a new racket that
 * matches a target 'dynamic tension' (DT) from an old racket.
 *
 * @param {number} targetDT - DT to match
 * @param {number} ratio - mains-to-crosses tension ratio (profile)
 * @param {object} specs - New racket specifications
 * @param {number} referenceHeadSize - Head size of the old racket
 * @returns {number} Suggested mains tension (lbs) rounded to nearest 0.5
 */
const findTensionForDT = (targetDT, ratio, specs, referenceHeadSize) => {
  let low = 10,
    high = 80;
  let bestTension = null;
  let bestError = Infinity;

  // Continue until precision of 0.01 lbs
  while (high - low > 0.01) {
    const mid = (low + high) / 2;
    const mains = mid;
    const crosses = mid * ratio;
    const dt = estimateDynamicTension(mains, crosses, specs, referenceHeadSize);

    const error = Math.abs(dt - targetDT);
    if (error < bestError) {
      bestError = error;
      bestTension = mains;
    }

    if (dt > targetDT) {
      high = mid;
    } else {
      low = mid;
    }
  }

  // Round mains tension to nearest 0.5 lbs
  return Math.round(bestTension * 2) / 2;
};

/**
 * convertWeight()
 * Utility to convert between pounds and kilograms.
 *
 * @param {number} value - Weight value to convert
 * @param {"lbs"|"kg"} from - Original unit
 * @param {"lbs"|"kg"} to - Desired unit
 * @returns {number} Converted value
 */
const convertWeight = (value, from, to) => {
  if (from === to) return value;
  return from === "lbs" ? value / 2.20462 : value * 2.20462;
};

/**
 * TensionCalculator Component
 * Renders UI for selecting an old racket, entering its tension, then
 * selecting a new racket to get suggested tensions to match feel.
 */
export default function TensionCalculator() {
  // State hooks for UI selections and values
  const [showOldSpecs, setShowOldSpecs] = useState(false);
  const [showNewSpecs, setShowNewSpecs] = useState(false);
  // Helper to render a summary of racket specs, including balance and recommended tension with unit conversion
  const renderRacketSpecs = (specs) => {
    if (!specs) return null;

    // Compute recommended tension string in correct units
    const recommendedTension = (() => {
      if (!specs.recommendedTension) return null;
      // Match pattern like "50-60 lb" or "22-27 kg"
      const match = specs.recommendedTension.match(/(\d+)-(\d+)/);
      if (!match) return specs.recommendedTension;

      let [_, min, max] = match.map(Number);
      if (unit === "kg") {
        min = (min / 2.20462).toFixed(1);
        max = (max / 2.20462).toFixed(1);
        return `${min}-${max} kg`;
      } else {
        return `${min}-${max} lb`;
      }
    })();

    return (
      <div className="grid gap-1 mt-2 mb-2 text-sm">
        <div>
          <Label>Head Size:</Label> <span>{specs.headSize} sq in</span>
        </div>
        <div>
          <Label>String Pattern:</Label>{" "}
          <span>
            {specs.pattern.mains}x{specs.pattern.crosses}
          </span>
        </div>
        <div>
          <Label>Strung Weight:</Label>{" "}
          <span>
            {specs.weight} g ({(specs.weight / 28.3495).toFixed(1)} oz)
          </span>
        </div>
        {specs.balance && (
          <div>
            <Label>Balance:</Label> <span>{specs.balance} mm</span>
          </div>
        )}
        <div>
          <Label>Stiffness:</Label> <span>{specs.stiffness} RA</span>
        </div>
        {recommendedTension && (
          <div>
            <Label>Recommended Tension:</Label>{" "}
            <span>{recommendedTension}</span>
          </div>
        )}
        {specs.stringingInstructions && (
          <div>
            <Label>Stringing Instructions:</Label>{" "}
            <span>{specs.stringingInstructions}</span>
          </div>
        )}
      </div>
    );
  };
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

  // Ratio presets for different tension profiles
  const profileRatios = {
    balanced: 1.0,
    spin: 0.97,
    control: 1.03,
  };

  // Load racket data on mount
  useEffect(() => {
    setRackets(racketsData);
  }, []);

  // Apply dark mode based on user preference
  useEffect(() => {
    const applyTheme = (e) =>
      document.documentElement.classList.toggle("dark", e.matches);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(mediaQuery);
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, []);

  // Toggle between lbs and kg for display
  const handleUnitSwitch = (val) => {
    setUnit(val ? "kg" : "lbs");
  };

  // Format tension for display
  const displayTension = (lbs) => {
    const val = unit === "kg" ? lbs / 2.20462 : lbs;
    return (Math.round(val * 2) / 2).toFixed(1);
  };

  // Parse user input, converting to lbs internally
  const parseTensionInput = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return unit === "kg" ? num * 2.20462 : num;
  };

  // Helper to find racket object by dropdown selection
  const getRacketBySelection = (sel) =>
    rackets.find(
      (r) =>
        r.brand === sel.brand &&
        r.product === sel.product &&
        r.variant === sel.variant &&
        r.version === sel.version
    );

  // Recalculate DTs and suggested tensions whenever inputs change
  useEffect(() => {
    const oldSpecs = getRacketBySelection(oldSelection);
    const newSpecs = getRacketBySelection(newSelection);

    // Only proceed if old racket is selected
    if (!oldSpecs) return;

    // Use old racket's headSize as reference
    const referenceHeadSize = oldSpecs.headSize;

    // Calculate and set old DT
    const calculatedOldDT = estimateDynamicTension(
      oldMainsLbs,
      oldCrossesLbs,
      oldSpecs,
      referenceHeadSize
    );
    setOldDT(calculatedOldDT);

    // If new racket selected, compute matched tensions
    if (newSpecs) {
      const ratio = profileRatios[tensionProfile];
      const mains = findTensionForDT(
        calculatedOldDT,
        ratio,
        newSpecs,
        referenceHeadSize
      );
      // Round crosses to nearest 0.5
      const crosses = Math.round(mains * ratio * 2) / 2;
      setSuggestedMains(mains);
      setSuggestedCrosses(crosses);

      // Calculate new DT for display
      const calculatedNewDT = estimateDynamicTension(
        mains,
        crosses,
        newSpecs,
        referenceHeadSize
      );
      setNewDT(calculatedNewDT);
    }
  }, [
    oldSelection,
    newSelection,
    oldMainsLbs,
    oldCrossesLbs,
    tensionProfile,
    rackets,
  ]);

  /**
   * uniqueValues()
   * Helper to extract unique values for dropdowns, with optional filtering.
   */
  const uniqueValues = (key, filter = {}) =>
    [
      ...new Set(
        rackets
          .filter((r) =>
            Object.entries(filter).every(([k, v]) => !v || r[k] === v)
          )
          .map((r) => r[key])
      ),
    ].sort();

  /**
   * renderRacketSelectors()
   * Renders the Brand/Product/Version/Variant dropdowns, resetting deeper
   * selections when a higher-level choice changes.
   */
  const renderRacketSelectors = (selection, setSelection) => (
    <>
      {/* Brand Dropdown */}
      <Label>Brand</Label>
      <Select
        onValueChange={(v) =>
          // Clear product, version, variant on brand change
          setSelection({ brand: v })
        }
      >
        <SelectTrigger className="dark:bg-gray-700">
          {selection.brand || "Select brand"}
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-700">
          {uniqueValues("brand")
            .sort()
            .map((val) => (
              <SelectItem key={val} value={val}>
                {val}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selection.brand && (
        <>
          {/* Product Dropdown */}
          <Label>Product</Label>
          <Select
            onValueChange={(v) =>
              // Keep brand, clear version & variant on product change
              setSelection((prev) => ({
                brand: prev.brand,
                product: v,
              }))
            }
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.product || "Select product"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("product", { brand: selection.brand })
                .sort()
                .map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </>
      )}

      {selection.product && (
        <>
          {/* Version Dropdown */}
          <Label>Version</Label>
          <Select
            onValueChange={(v) =>
              // Keep brand & product, clear variant on version change
              setSelection((prev) => ({
                brand: prev.brand,
                product: prev.product,
                version: v,
              }))
            }
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.version || "Select version"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("version", {
                brand: selection.brand,
                product: selection.product,
              })
                .sort()
                .map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </>
      )}

      {selection.version && (
        <>
          {/* Variant Dropdown */}
          <Label>Variant</Label>
          <Select
            onValueChange={(v) =>
              // Set variant, keep above selections
              setSelection((prev) => ({
                ...prev,
                variant: v,
              }))
            }
          >
            <SelectTrigger className="dark:bg-gray-700">
              {selection.variant || "Select variant"}
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              {uniqueValues("variant", {
                brand: selection.brand,
                product: selection.product,
                version: selection.version,
              })
                .sort()
                .map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );

  /**
   * renderLabeledInput()
   * Wraps the Input component with optional unit display and readonly styling.
   */
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
            ? "pointer-events-none font-semibold focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent"
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
    <div className="pl-6 pr-6 pb-6 max-w-6xl mx-auto text-black dark:text-white min-h-screen transition-colors duration-300">
      <div className="text-center mt-12 mb-12">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Tennis String Tension Calculator
        </h1>
        <p className="text-gray-600 mt-3 dark:text-gray-400 text-sm">
          Match stringbed feel between rackets by preserving dynamic tension
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Racket Panel */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardContent className="p-4 grid gap-6">
            <Label className="font-bold text-lg">Old Racket</Label>

            <div className="grid gap-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Racket
              </Label>
              {renderRacketSelectors(oldSelection, setOldSelection)}
              {/* Show Specs toggle and summary */}
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowOldSpecs((v) => !v)}
                  disabled={!getRacketBySelection(oldSelection)}
                >
                  {showOldSpecs ? "Hide Specs" : "Show Specs"}
                </button>
                {showOldSpecs && getRacketBySelection(oldSelection) && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 mt-2">
                    {renderRacketSpecs(getRacketBySelection(oldSelection))}
                  </div>
                )}
              </div>
            </div>

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
                {renderLabeledInput(
                  oldDT !== null ? oldDT.toFixed(1) : "",
                  null,
                  true,
                  false
                )}
              </div>
            </div>

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

        {/* New Racket Panel */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardContent className="p-4 grid gap-6">
            <Label className="font-bold text-lg">New Racket</Label>

            <div className="grid gap-4">
              <Label className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Racket
              </Label>
              {renderRacketSelectors(newSelection, setNewSelection)}
              {/* Show Specs toggle and summary */}
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowNewSpecs((v) => !v)}
                  disabled={!getRacketBySelection(newSelection)}
                >
                  {showNewSpecs ? "Hide Specs" : "Show Specs"}
                </button>
                {showNewSpecs && getRacketBySelection(newSelection) && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 mt-2">
                    {renderRacketSpecs(getRacketBySelection(newSelection))}
                  </div>
                )}
              </div>
            </div>

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
                {renderLabeledInput(
                  newDT !== null ? newDT.toFixed(1) : "",
                  null,
                  true,
                  false
                )}
              </div>
            </div>

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
