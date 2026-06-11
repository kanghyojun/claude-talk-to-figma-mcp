import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";
import { coerceJson } from "../utils/schema-helpers";

export function registerFigmaToCodeTools(server: McpServer): void {
  server.tool(
    "figma_to_code",
    "Convert the current Figma selection, or explicit node IDs, into code using the vendored FigmaToCode converter",
    {
      framework: z
        .enum(["HTML", "Tailwind", "Flutter", "SwiftUI", "Compose"])
        .default("HTML")
        .describe("Target output framework"),
      nodeIds: coerceJson(z.array(z.string()))
        .optional()
        .describe("Optional array of Figma node IDs. If omitted, the current Figma selection is converted."),
      settings: coerceJson(z.record(z.unknown()))
        .optional()
        .describe("Optional FigmaToCode PluginSettings overrides, such as htmlGenerationMode or tailwindGenerationMode."),
      maxNodeCount: z.number().int().positive().optional().describe("Safety limit for total selected descendant nodes. Defaults to 4000."),
    },
    async ({ framework, nodeIds, settings, maxNodeCount }) => {
      try {
        const result = await sendCommandToFigma("figma_to_code", {
          framework,
          nodeIds,
          settings,
          maxNodeCount,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error converting Figma to code: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
