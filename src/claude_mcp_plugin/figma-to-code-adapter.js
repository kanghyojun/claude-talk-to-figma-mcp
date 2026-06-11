import { nodesToJSON, resetPerformanceCounters } from "../../FigmaToCode/packages/backend/src/altNodes/jsonNodeConversion.ts";
import { oldConvertNodesToAltNodes } from "../../FigmaToCode/packages/backend/src/altNodes/oldAltConversion.ts";
import { clearWarnings, warnings } from "../../FigmaToCode/packages/backend/src/common/commonConversionWarnings.ts";
import { convertToCode } from "../../FigmaToCode/packages/backend/src/common/retrieveUI/convertToCode.ts";

const DEFAULT_SETTINGS = {
  framework: "HTML",
  showLayerNames: false,
  useOldPluginVersion2025: false,
  responsiveRoot: false,
  flutterGenerationMode: "snippet",
  swiftUIGenerationMode: "snippet",
  composeGenerationMode: "snippet",
  roundTailwindValues: true,
  roundTailwindColors: true,
  useColorVariables: true,
  customTailwindPrefix: "",
  embedImages: false,
  embedVectors: false,
  htmlGenerationMode: "html",
  tailwindGenerationMode: "jsx",
  baseFontSize: 16,
  useTailwind4: true,
  thresholdPercent: 15,
  baseFontFamily: "",
  fontFamilyCustomConfig: {},
};

const FRAMEWORKS = {
  html: "HTML",
  tailwind: "Tailwind",
  flutter: "Flutter",
  swiftui: "SwiftUI",
  swift_ui: "SwiftUI",
  compose: "Compose",
};

function normalizeFramework(value) {
  if (!value) return DEFAULT_SETTINGS.framework;
  const key = String(value).replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const normalized = FRAMEWORKS[key] || FRAMEWORKS[key.replace(/_/g, "")];
  if (!normalized) {
    throw new Error(`Unsupported framework: ${value}`);
  }
  return normalized;
}

function countNodes(nodes) {
  let count = 0;
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.pop();
    count += 1;
    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        stack.push(child);
      }
    }
  }
  return count;
}

function nodeSummary(nodes) {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }));
}

async function resolveNodes(params) {
  if (Array.isArray(params?.nodeIds) && params.nodeIds.length > 0) {
    const nodes = [];
    for (const nodeId of params.nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      if (!("visible" in node)) {
        throw new Error(`Node is not a scene node: ${nodeId}`);
      }
      nodes.push(node);
    }
    return nodes;
  }

  await figma.currentPage.loadAsync();
  return [...figma.currentPage.selection];
}

function buildSettings(params) {
  const overrides = params?.settings && typeof params.settings === "object" ? params.settings : {};
  return {
    ...DEFAULT_SETTINGS,
    ...overrides,
    framework: normalizeFramework(params?.framework || overrides.framework),
  };
}

export async function convertFigmaToCode(params = {}) {
  resetPerformanceCounters();
  clearWarnings();

  const nodes = await resolveNodes(params);
  if (nodes.length === 0) {
    throw new Error("No Figma nodes selected. Select a node or pass nodeIds.");
  }

  const maxNodeCount = Number.isFinite(params.maxNodeCount) ? params.maxNodeCount : 4000;
  const nodeCount = countNodes(nodes);
  if (nodeCount > maxNodeCount) {
    throw new Error(`Selection too large (${nodeCount} nodes). Maximum is ${maxNodeCount}.`);
  }

  const settings = buildSettings(params);
  const convertedSelection = settings.useOldPluginVersion2025
    ? oldConvertNodesToAltNodes(nodes, null)
    : await nodesToJSON(nodes, settings);

  if (!convertedSelection.length) {
    throw new Error("FigmaToCode could not convert the selected nodes.");
  }

  const code = await convertToCode(convertedSelection, settings);

  return {
    framework: settings.framework,
    nodeCount,
    nodes: nodeSummary(nodes),
    code,
    warnings: [...warnings],
    settings,
  };
}
