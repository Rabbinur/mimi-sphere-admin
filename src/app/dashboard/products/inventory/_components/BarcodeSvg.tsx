"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeSvgProps {
    value: string;
    height?: number;
    width?: number;
    fontSize?: number;
    displayValue?: boolean;
    className?: string;
}

export function BarcodeSvg({
    value,
    height = 55,
    width = 2,
    fontSize,
    displayValue = true,
    className = "",
}: BarcodeSvgProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                const cleanValue = String(value).trim();
                if (cleanValue) {
                    const svg = svgRef.current;

                    // Reserve 18px for bottom text baseline so black bars never overlap text
                    const barHeight = displayValue ? Math.max(30, height - 18) : height;

                    // Render barcode rects using JsBarcode
                    JsBarcode(svg, cleanValue, {
                        format: "CODE128",
                        height: barHeight,
                        width,
                        displayValue: false,
                        margin: 10,
                        background: "#ffffff",
                        lineColor: "#000000",
                    });

                    // Set crispEdges shape rendering on SVG and all rects to prevent line bleeding/blurring
                    svg.setAttribute("shape-rendering", "crispEdges");
                    const rects = Array.from(svg.querySelectorAll("rect"));
                    rects.forEach((rect) => rect.setAttribute("shape-rendering", "crispEdges"));

                    // Remove any pre-existing text element from previous render
                    const oldTexts = Array.from(svg.querySelectorAll("text"));
                    oldTexts.forEach((t) => t.remove());

                    if (displayValue) {
                        let minX = Infinity;
                        let maxX = -Infinity;
                        let maxY = -Infinity;

                        rects.forEach((rect) => {
                            const fill = rect.getAttribute("fill");
                            if (fill && fill.toLowerCase() === "#ffffff") return;

                            const x = parseFloat(rect.getAttribute("x") || "0");
                            const w = parseFloat(rect.getAttribute("width") || "0");
                            const y = parseFloat(rect.getAttribute("y") || "0");
                            const h = parseFloat(rect.getAttribute("height") || "0");

                            if (x < minX) minX = x;
                            if (x + w > maxX) maxX = x + w;
                            if (y + h > maxY) maxY = y + h;
                        });

                        if (isFinite(minX) && isFinite(maxX) && isFinite(maxY) && maxX > minX) {
                            const barcodeWidth = maxX - minX;
                            const centerX = (minX + maxX) / 2;
                            const len = cleanValue.length;

                            // Larger, prominent font size (14px - 20px)
                            let targetFontSize = fontSize || Math.min(20, Math.max(14, barcodeWidth / (len * 0.5)));

                            // Text baseline y position: maxY (bottom of black bars) + targetFontSize + generous 12px gap
                            const textBaselineY = maxY + targetFontSize + 12;

                            // Create centered text with clean spacing under the barcode
                            const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            textEl.textContent = cleanValue;
                            textEl.setAttribute("x", String(centerX));
                            textEl.setAttribute("y", String(textBaselineY));
                            textEl.setAttribute("text-anchor", "middle");
                            textEl.setAttribute("font-family", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace");
                            textEl.setAttribute("font-size", `${targetFontSize.toFixed(1)}px`);
                            textEl.setAttribute("font-weight", "900");
                            textEl.setAttribute("letter-spacing", "2px");
                            textEl.setAttribute("fill", "#000000");

                            svg.appendChild(textEl);

                            // Dynamically expand SVG height & viewBox to fit barcode + gap + text + padding
                            const totalSvgHeight = Math.ceil(textBaselineY + 14);
                            svg.setAttribute("height", String(totalSvgHeight));

                            const viewBox = svg.getAttribute("viewBox");
                            if (viewBox) {
                                const parts = viewBox.split(" ").map(Number);
                                if (parts.length === 4) {
                                    parts[3] = Math.max(parts[3], totalSvgHeight);
                                    svg.setAttribute("viewBox", parts.join(" "));
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Barcode generation error for value:", value, err);
            }
        }
    }, [value, height, width, fontSize, displayValue]);

    if (!value) return null;

    return <svg ref={svgRef} className={`max-w-full h-auto ${className}`} />;
}
