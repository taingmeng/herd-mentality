import * as React from "react";
// import { Slider } from "@base-ui-components/react/slider";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

const PrettoSlider = styled(Slider)({
  color: "#9d174d",
  height: 16,
  "& .MuiSlider-root": {
    padding: 0,
  },
  "& .MuiSlider-track": {
    border: "none",
    marginBottom: 2,
    backgroundColor: "#9d174d",
  },
  "& .MuiSlider-rail": {
    opacity: 100,
    border: "none",
    backgroundColor: "#9d174d",
    "&.Mui-disabled": {
      backgroundColor: "#9d174d",
      opacity: 0.5,
    },
  },
  "& .MuiSlider-thumb": {
    height: 64,
    width: 64,
    backgroundColor: "#fff",
    border: "3px solid #db2777",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },

    "&::before": {
      display: "none",
    },
    borderRadius: "50% 50% 50% 0",
    transformOrigin: "bottom left",
    transform: "translate(0%, -100%) rotate(135deg) scale(1)",
    "&:hover, &$active": {
      transform: "translate(0%, -100%) rotate(135deg) scale(3)",
    },
  },

  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#db2777",
    transformOrigin: "bottom left",
    transform: "translate(150%, -100%) scale(0)",
    "&::before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(150%, -100%) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
  "& .MuiSlider-markLabel": {
    color: "white",
    marginTop: -48,
    marginLeft: 8,
    fontSize: 20,
  },
  "& .MuiSlider-mark": {
    color: "white",
    width: 16,
    height: 8,
    borderLeft: "3px solid #9d174d",
    select: "none",
  },
});

export interface WavelengthSliderProps {
  disabled?: boolean;
  currentValue: number;
  hiddenValue: number;
  showMarkers?: boolean;
  onChange?: (value: number) => void;
}

const getSlot = (
  currentValue: number,
  hiddenValue: number,
  width: number
): number => {
  if (Math.abs(currentValue - hiddenValue) <= width / 2) {
    return 2; // Perfect match
  } else if (Math.abs(currentValue - hiddenValue) <= width / 2 + width) {
    return currentValue - hiddenValue > 0 ? 3 : 1; // Close match
  } else if (Math.abs(currentValue - hiddenValue) <= width / 2 + width * 2) {
    return currentValue - hiddenValue > 0 ? 4 : 0; // Moderate match
  } else {
    return -1; // No match
  }
};

export default function WavelengthSlider({
  disabled,
  currentValue,
  hiddenValue,
  showMarkers,
  onChange,
}: WavelengthSliderProps) {
  const width = 40;
  const slot = getSlot(currentValue, hiddenValue, width);

  return (
    <div className="p-8 w-full max-w-5xl select-none">
      <div className="h-16 mb-[-20px] flex">
        {showMarkers && (
          <div className="flex w-full">
            <div
              style={{
                flex: hiddenValue - width * 2.5,
                display: hiddenValue - width * 2.5 > 0 ? "block" : "none",
              }}
            ></div>
            {[2, 3, 4, 3, 2].map((value, index) => {
              const shiftedIndex = index - 2; // Shift index to center around 0
              const flex =
                shiftedIndex < 0
                  ? hiddenValue < -shiftedIndex * width
                    ? -1
                    : Math.min(
                        width,
                        Math.abs(hiddenValue + shiftedIndex * width)
                      )
                  : shiftedIndex > 0
                    ? hiddenValue > 1000 - shiftedIndex * width
                      ? -1
                      : Math.min(
                          width,
                          Math.abs(hiddenValue + shiftedIndex * width - 1000)
                        )
                    : width;
              const display = flex <= 0 ? "none" : "block";
              console.log(
                "Hidden Value:",
                hiddenValue,
                "Flex:",
                flex,
                "Display:",
                display
              );
              return (
                <div
                  key={index}
                  className={`text-center ${
                    index === 2
                      ? "bg-blue-500"
                      : index === 1 || index === 3
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                  style={{
                    display,
                    flex,
                  }}
                >
                  {value}
                  {slot === index && <div>↑</div>}
                </div>
              );
            })}

            <div
              style={{
                flex: 1000 - hiddenValue - width * 2.5,
                display:
                  1000 - hiddenValue - width * 2.5 > 0 ? "block" : "none",
              }}
            ></div>
          </div>
        )}
      </div>
      <PrettoSlider
        disabled={disabled}
        size="medium"
        color="secondary"
        aria-label="Restricted values"
        defaultValue={500}
        valueLabelDisplay="off"
        value={currentValue}
        min={0}
        max={1000}
        onChange={(_, value) => {
          // Handle the change event if needed
          onChange && onChange(value as number);
        }}
      />
    </div>
  );
}
