import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/* =======================
   HSL PARSE / FORMAT
======================= */

function parseHSL(hsl: string): { h: number; s: number; l: number } {
  const match = hsl.match(
    /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?/
  );
  if (match) {
    return {
      h: parseFloat(match[1]),
      s: parseFloat(match[2]),
      l: parseFloat(match[3]),
    };
  }
  return { h: 220, s: 50, l: 50 };
}

function formatHSL(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

/* =======================
   COLOR CONVERTERS
======================= */

function hexToHSL(hex: string) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHSL(rgb: string) {
  const match = rgb.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
  if (!match) return null;

  const r = +match[1] / 255;
  const g = +match[2] / 255;
  const b = +match[3] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/* =======================
   NORMALIZER (KEY LOGIC)
======================= */

function normalizeToHSL(input: string): string | null {
  const value = input.trim();

  // HEX
  if (value.startsWith("#")) {
    const hsl = hexToHSL(value);
    return formatHSL(hsl.h, hsl.s, hsl.l);
  }

  // RGB
  if (value.startsWith("rgb")) {
    const hsl = rgbToHSL(value);
    if (!hsl) return null;
    return formatHSL(hsl.h, hsl.s, hsl.l);
  }

  // HSL
  if (/^\d+\s+\d+%\s+\d+%$/.test(value)) {
    return value;
  }

  return null;
}

/* =======================
   COMPONENT
======================= */

export function ColorPicker({
  value,
  onChange,
  className,
}: ColorPickerProps) {
  const parsed = parseHSL(value || "220 50% 50%");
  const [hue, setHue] = React.useState(parsed.h);
  const [saturation, setSaturation] = React.useState(parsed.s);
  const [lightness, setLightness] = React.useState(parsed.l);

  React.useEffect(() => {
    const p = parseHSL(value || "220 50% 50%");
    setHue(p.h);
    setSaturation(p.s);
    setLightness(p.l);
  }, [value]);

  const handleChange = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    onChange(formatHSL(h, s, l)); // ✅ ALWAYS HSL
  };

  const colorStyle = {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            className
          )}
        >
          <div
            className="w-6 h-6 rounded-md border border-border mr-3 shrink-0"
            style={colorStyle}
          />
          <span className="text-sm font-mono text-muted-foreground truncate">
            {value || "Select color"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 bg-white" align="start">
        <div className="space-y-4">
          <div
            className="w-full h-24 rounded-lg border border-border"
            style={colorStyle}
          />

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Hue</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(hue)}°
                </span>
              </div>
              <Slider
                value={[hue]}
                onValueChange={([v]) =>
                  handleChange(v, saturation, lightness)
                }
                max={360}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Saturation</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(saturation)}%
                </span>
              </div>
              <Slider
                value={[saturation]}
                onValueChange={([v]) =>
                  handleChange(hue, v, lightness)
                }
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Lightness</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(lightness)}%
                </span>
              </div>
              <Slider
                value={[lightness]}
                onValueChange={([v]) =>
                  handleChange(hue, saturation, v)
                }
                max={100}
                step={1}
              />
            </div>
          </div>

          <div className="pt-2 border-t">
            <Label className="text-xs mb-2 block">
              Color Value (HSL / HEX / RGB)
            </Label>
            <Input
              value={value}
              placeholder="220 50% 50% | #3b82f6 | rgb(59,130,246)"
              onChange={(e) => {
                const normalized = normalizeToHSL(e.target.value);
                if (normalized) {
                  onChange(normalized); // 🔥 backend-safe
                }
              }}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
