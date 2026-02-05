import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";
import { coerceJson } from "../utils/schema-helpers";

/**
 * Register style-related tools to the MCP server.
 * This module covers local paint/text/effect style creation and style application.
 */
export function registerStyleTools(server: McpServer): void {
  // Create Paint Style Tool
  server.tool(
    "create_paint_style",
    "Create a local paint style (solid color) in Figma",
    {
      name: z.string().min(1).describe("Name of the paint style"),
      r: z.coerce.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.coerce.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.coerce.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.coerce.number().min(0).max(1).optional().describe("Alpha/opacity (0-1, defaults to 1)"),
      description: z.string().optional().describe("Optional style description"),
    },
    async ({ name, r, g, b, a, description }) => {
      try {
        const result = await sendCommandToFigma("create_paint_style", {
          name,
          color: { r, g, b, a: a ?? 1 },
          description,
        });
        const typedResult = result as { id: string; name: string; key: string };
        return {
          content: [
            {
              type: "text",
              text: `Created paint style "${typedResult.name}" (${typedResult.id})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating paint style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Text Style Tool
  server.tool(
    "create_text_style",
    "Create a local text style in Figma",
    {
      name: z.string().min(1).describe("Name of the text style"),
      fontFamily: z.string().optional().describe("Font family (default: Inter)"),
      fontStyle: z.string().optional().describe("Font style (default: Regular)"),
      fontSize: z.coerce.number().positive().optional().describe("Font size in px (default: 16)"),
      lineHeightPx: z.coerce.number().positive().optional().describe("Line height in px"),
      letterSpacingPx: z.coerce.number().optional().describe("Letter spacing in px"),
      description: z.string().optional().describe("Optional style description"),
      lineHeight: z.number().optional().describe("Legacy line height value"),
      lineHeightUnit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional().describe("Legacy line height unit"),
      letterSpacing: z.number().optional().describe("Legacy letter spacing value"),
      letterSpacingUnit: z.enum(["PIXELS", "PERCENT"]).optional().describe("Legacy letter spacing unit"),
      textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).optional().describe("Text case transformation"),
      textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).optional().describe("Text decoration type"),
    },
    async ({
      name,
      fontFamily,
      fontStyle,
      fontSize,
      lineHeightPx,
      letterSpacingPx,
      description,
      lineHeight,
      lineHeightUnit,
      letterSpacing,
      letterSpacingUnit,
      textCase,
      textDecoration,
    }) => {
      try {
        const payload: Record<string, unknown> = {
          name,
          fontFamily,
          fontStyle,
          fontSize,
          lineHeightPx,
          letterSpacingPx,
          description,
        };
        if (lineHeight !== undefined) payload.lineHeight = lineHeight;
        if (lineHeightUnit !== undefined) payload.lineHeightUnit = lineHeightUnit;
        if (letterSpacing !== undefined) payload.letterSpacing = letterSpacing;
        if (letterSpacingUnit !== undefined) payload.letterSpacingUnit = letterSpacingUnit;
        if (textCase !== undefined) payload.textCase = textCase;
        if (textDecoration !== undefined) payload.textDecoration = textDecoration;

        const result = await sendCommandToFigma("create_text_style", payload);
        const typedResult = result as { id: string; name: string; key: string };
        return {
          content: [
            {
              type: "text",
              text: `Created text style "${typedResult.name}" (${typedResult.id})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating text style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Fill Style ID Tool
  server.tool(
    "set_fill_style_id",
    "Apply a paint style to a node's fill in Figma",
    {
      nodeId: z.string().describe("ID of the node to modify"),
      fillStyleId: z.string().describe("Paint style ID (or key) to apply"),
    },
    async ({ nodeId, fillStyleId }) => {
      try {
        const result = await sendCommandToFigma("set_fill_style_id", {
          nodeId,
          fillStyleId,
        });
        const typedResult = result as { name: string; styleName: string };
        return {
          content: [
            {
              type: "text",
              text: `Applied fill style "${typedResult.styleName}" to node "${typedResult.name}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting fill style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Effect Style Tool
  server.tool(
    "create_effect_style",
    "Create a reusable effect style (shadows, blurs) in Figma's local styles.",
    {
      name: z.string().describe("Name for the style (e.g., 'Shadow/Medium' or 'Glass/Blur')"),
      effects: coerceJson(
        z.array(
          z.object({
            type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).describe("Effect type"),
            radius: z.number().optional().describe("Blur radius"),
            offset: z
              .object({
                x: z.number().describe("X offset"),
                y: z.number().describe("Y offset"),
              })
              .optional()
              .describe("Shadow offset"),
            color: z
              .object({
                r: z.number().min(0).max(1).describe("Red (0-1)"),
                g: z.number().min(0).max(1).describe("Green (0-1)"),
                b: z.number().min(0).max(1).describe("Blue (0-1)"),
                a: z.number().min(0).max(1).optional().describe("Alpha (0-1)"),
              })
              .optional()
              .describe("Effect color"),
            visible: z.boolean().optional().describe("Whether effect is visible"),
            spread: z.number().optional().describe("Spread radius for shadows"),
            blendMode: z.string().optional().describe("Blend mode (e.g., 'NORMAL', 'MULTIPLY')"),
          })
        )
      ).describe("Array of effects to apply and store in the style"),
    },
    async ({ name, effects }) => {
      try {
        const result = await sendCommandToFigma("create_effect_style", {
          name,
          effects,
        });

        const typedResult = result as { id: string; name: string; key: string; effectCount: number };
        return {
          content: [
            {
              type: "text",
              text: `Created effect style "${typedResult.name}" with ${typedResult.effectCount} effect(s) (ID: ${typedResult.id}, key: ${typedResult.key})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating effect style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
