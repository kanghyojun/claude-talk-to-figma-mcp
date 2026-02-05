import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";
import { applyColorDefaults, applyDefault, FIGMA_DEFAULTS } from "../utils/defaults";
import { Color } from "../types/color";

/**
 * Register modification tools to the MCP server
 * This module contains tools for modifying existing elements in Figma
 * @param server - The MCP server instance
 */
export function registerModificationTools(server: McpServer): void {
  // Set Fill Color Tool
  server.tool(
    "set_fill_color",
    "Set the fill color of a node in Figma. Alpha component defaults to 1 (fully opaque) if not specified. Use alpha 0 for fully transparent.",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.coerce.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.coerce.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.coerce.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.coerce.number().min(0).max(1).optional().describe("Alpha component (0-1, defaults to 1 if not specified)"),
    },
    async ({ nodeId, r, g, b, a }) => {
      try {
        // Additional validation: Ensure RGB values are provided (they should not be undefined)
        if (r === undefined || g === undefined || b === undefined) {
          throw new Error("RGB components (r, g, b) are required and cannot be undefined");
        }
        
        // Apply default values safely - preserves opacity 0 for transparency
        const colorInput: Color = { r, g, b, a };
        const colorWithDefaults = applyColorDefaults(colorInput);
        
        const result = await sendCommandToFigma("set_fill_color", {
          nodeId,
          color: colorWithDefaults,
        });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Set fill color of node "${typedResult.name}" to RGBA(${r}, ${g}, ${b}, ${colorWithDefaults.a})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting fill color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Stroke Color Tool
  server.tool(
    "set_stroke_color",
    "Set the stroke color of a node in Figma (defaults: opacity 1, weight 1)",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.coerce.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.coerce.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.coerce.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.coerce.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
      strokeWeight: z.coerce.number().min(0).optional().describe("Stroke weight >= 0)"),
    },
    async ({ nodeId, r, g, b, a, strokeWeight }) => {
      try {

        if (r === undefined || g === undefined || b === undefined) {
          throw new Error("RGB components (r, g, b) are required and cannot be undefined");
        }
        
        const colorInput: Color = { r, g, b, a };
        const colorWithDefaults = applyColorDefaults(colorInput);
        
        const strokeWeightWithDefault = applyDefault(strokeWeight, FIGMA_DEFAULTS.stroke.weight);
        
        const result = await sendCommandToFigma("set_stroke_color", {
          nodeId,
          color: colorWithDefaults,
          strokeWeight: strokeWeightWithDefault,
        });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Set stroke color of node "${typedResult.name}" to RGBA(${r}, ${g}, ${b}, ${colorWithDefaults.a}) with weight ${strokeWeightWithDefault}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting stroke color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Move Node Tool
  server.tool(
    "move_node",
    "Move a node to a new position in Figma",
    {
      nodeId: z.string().describe("The ID of the node to move"),
      x: z.coerce.number().describe("New X position"),
      y: z.coerce.number().describe("New Y position"),
    },
    async ({ nodeId, x, y }) => {
      try {
        const result = await sendCommandToFigma("move_node", { nodeId, x, y });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Moved node "${typedResult.name}" to position (${x}, ${y})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error moving node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Resize Node Tool
  server.tool(
    "resize_node",
    "Resize a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to resize"),
      width: z.coerce.number().positive().describe("New width"),
      height: z.coerce.number().positive().describe("New height"),
    },
    async ({ nodeId, width, height }) => {
      try {
        const result = await sendCommandToFigma("resize_node", {
          nodeId,
          width,
          height,
        });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Resized node "${typedResult.name}" to width ${width} and height ${height}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error resizing node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Delete Node Tool
  server.tool(
    "delete_node",
    "Delete a node from Figma",
    {
      nodeId: z.string().describe("The ID of the node to delete"),
    },
    async ({ nodeId }) => {
      try {
        await sendCommandToFigma("delete_node", { nodeId });
        return {
          content: [
            {
              type: "text",
              text: `Deleted node with ID: ${nodeId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Corner Radius Tool
  server.tool(
    "set_corner_radius",
    "Set the corner radius of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      radius: z.coerce.number().min(0).describe("Corner radius value"),
      corners: z
        .array(z.boolean())
        .length(4)
        .optional()
        .describe(
          "Optional array of 4 booleans to specify which corners to round [topLeft, topRight, bottomRight, bottomLeft]"
        ),
    },
    async ({ nodeId, radius, corners }) => {
      try {
        const result = await sendCommandToFigma("set_corner_radius", {
          nodeId,
          radius,
          corners: corners || [true, true, true, true],
        });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Set corner radius of node "${typedResult.name}" to ${radius}px`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting corner radius: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Auto Layout Tool
  server.tool(
    "set_auto_layout",
    "Configure auto layout properties for a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to configure auto layout"),
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).describe("Layout direction"),
      paddingTop: z.coerce.number().optional().describe("Top padding in pixels"),
      paddingBottom: z.coerce.number().optional().describe("Bottom padding in pixels"),
      paddingLeft: z.coerce.number().optional().describe("Left padding in pixels"),
      paddingRight: z.coerce.number().optional().describe("Right padding in pixels"),
      itemSpacing: z.coerce.number().optional().describe("Spacing between items in pixels"),
      primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().describe("Alignment along primary axis"),
      counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX"]).optional().describe("Alignment along counter axis"),
      layoutWrap: z.enum(["WRAP", "NO_WRAP"]).optional().describe("Whether items wrap to new lines"),
      strokesIncludedInLayout: z.boolean().optional().describe("Whether strokes are included in layout calculations")
    },
    async ({ nodeId, layoutMode, paddingTop, paddingBottom, paddingLeft, paddingRight, 
             itemSpacing, primaryAxisAlignItems, counterAxisAlignItems, layoutWrap, strokesIncludedInLayout }) => {
      try {
        const result = await sendCommandToFigma("set_auto_layout", { 
          nodeId, 
          layoutMode, 
          paddingTop, 
          paddingBottom, 
          paddingLeft, 
          paddingRight, 
          itemSpacing, 
          primaryAxisAlignItems, 
          counterAxisAlignItems, 
          layoutWrap, 
          strokesIncludedInLayout 
        });
        
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Applied auto layout to node "${typedResult.name}" with mode: ${layoutMode}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting auto layout: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Set Effects Tool
  server.tool(
    "set_effects",
    "Set the visual effects of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effects: z.array(
        z.object({
          type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).describe("Effect type"),
          color: z.object({
            r: z.coerce.number().min(0).max(1).describe("Red (0-1)"),
            g: z.coerce.number().min(0).max(1).describe("Green (0-1)"),
            b: z.coerce.number().min(0).max(1).describe("Blue (0-1)"),
            a: z.coerce.number().min(0).max(1).describe("Alpha (0-1)")
          }).optional().describe("Effect color (for shadows)"),
          offset: z.object({
            x: z.coerce.number().describe("X offset"),
            y: z.coerce.number().describe("Y offset")
          }).optional().describe("Offset (for shadows)"),
          radius: z.coerce.number().optional().describe("Effect radius"),
          spread: z.coerce.number().optional().describe("Shadow spread (for shadows)"),
          visible: z.boolean().optional().describe("Whether the effect is visible"),
          blendMode: z.string().optional().describe("Blend mode")
        })
      ).describe("Array of effects to apply")
    },
    async ({ nodeId, effects }) => {
      try {
        const result = await sendCommandToFigma("set_effects", {
          nodeId,
          effects
        });
        
        const typedResult = result as { name: string, effects: any[] };
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully applied ${effects.length} effect(s) to node "${typedResult.name}"`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting effects: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Set Effect Style ID Tool
  server.tool(
    "set_effect_style_id",
    "Apply an effect style to a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effectStyleId: z.string().describe("The ID of the effect style to apply")
    },
    async ({ nodeId, effectStyleId }) => {
      try {
        const result = await sendCommandToFigma("set_effect_style_id", {
          nodeId,
          effectStyleId
        });
        
        const typedResult = result as { name: string, effectStyleId: string };
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully applied effect style to node "${typedResult.name}"`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting effect style: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Set Locked Tool
  server.tool(
    "set_locked",
    "Lock or unlock a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to update"),
      locked: z.boolean().describe("Whether the node should be locked"),
    },
    async ({ nodeId, locked }) => {
      try {
        const result = await sendCommandToFigma("set_locked", { nodeId, locked });
        const typedResult = result as { name: string; locked: boolean };
        return {
          content: [
            {
              type: "text",
              text: `${typedResult.locked ? "Locked" : "Unlocked"} node "${typedResult.name}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting lock state: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Visible Tool
  server.tool(
    "set_visible",
    "Show or hide a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to update"),
      visible: z.boolean().describe("Whether the node should be visible"),
    },
    async ({ nodeId, visible }) => {
      try {
        const result = await sendCommandToFigma("set_visible", { nodeId, visible });
        const typedResult = result as { name: string; visible: boolean };
        return {
          content: [
            {
              type: "text",
              text: `${typedResult.visible ? "Showed" : "Hid"} node "${typedResult.name}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting visibility: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Reorder Node Tool
  server.tool(
    "reorder_node",
    "Change the layer order of a node in its parent",
    {
      nodeId: z.string().describe("The ID of the node to reorder"),
      newIndex: z.coerce.number().int().min(0).describe("New index in the parent children list"),
    },
    async ({ nodeId, newIndex }) => {
      try {
        const result = await sendCommandToFigma("reorder_node", { nodeId, newIndex });
        const typedResult = result as { name: string; newIndex: number };
        return {
          content: [
            {
              type: "text",
              text: `Moved node "${typedResult.name}" to layer index ${typedResult.newIndex}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reordering node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Align Nodes Tool
  server.tool(
    "align_nodes",
    "Align multiple nodes (left, center, right, top, middle, bottom)",
    {
      nodeIds: z.array(z.string()).min(2).describe("Node IDs to align"),
      alignment: z.enum(["left", "center", "right", "top", "middle", "bottom"]).describe("Alignment mode"),
    },
    async ({ nodeIds, alignment }) => {
      try {
        const result = await sendCommandToFigma("align_nodes", { nodeIds, alignment });
        const typedResult = result as { alignedCount: number; alignment: string };
        return {
          content: [
            {
              type: "text",
              text: `Aligned ${typedResult.alignedCount} node(s) using "${typedResult.alignment}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error aligning nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Distribute Nodes Tool
  server.tool(
    "distribute_nodes",
    "Distribute multiple nodes with equal spacing horizontally or vertically",
    {
      nodeIds: z.array(z.string()).min(3).describe("Node IDs to distribute"),
      direction: z.enum(["horizontal", "vertical"]).describe("Distribution direction"),
      spacing: z.coerce.number().optional().describe("Optional fixed spacing in px (auto-calculated if omitted)"),
    },
    async ({ nodeIds, direction, spacing }) => {
      try {
        const result = await sendCommandToFigma("distribute_nodes", { nodeIds, direction, spacing });
        const typedResult = result as { distributedCount: number; direction: string; spacing: number };
        return {
          content: [
            {
              type: "text",
              text: `Distributed ${typedResult.distributedCount} node(s) ${typedResult.direction} with spacing ${typedResult.spacing}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error distributing nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Constraints Tool
  server.tool(
    "set_constraints",
    "Set constraints on a node in auto-layout/frame parents",
    {
      nodeId: z.string().describe("Node ID"),
      horizontal: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).describe("Horizontal constraint"),
      vertical: z.enum(["MIN", "CENTER", "MAX", "STRETCH", "SCALE"]).describe("Vertical constraint"),
    },
    async ({ nodeId, horizontal, vertical }) => {
      try {
        const result = await sendCommandToFigma("set_constraints", { nodeId, horizontal, vertical });
        const typedResult = result as { name: string; constraints: { horizontal: string; vertical: string } };
        return {
          content: [
            {
              type: "text",
              text: `Set constraints on "${typedResult.name}" to ${typedResult.constraints.horizontal}/${typedResult.constraints.vertical}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting constraints: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Blend Mode Tool
  server.tool(
    "set_blend_mode",
    "Set blend mode on a node in Figma",
    {
      nodeId: z.string().describe("Node ID"),
      blendMode: z.string().describe("Figma blend mode (e.g. NORMAL, MULTIPLY, SCREEN)"),
    },
    async ({ nodeId, blendMode }) => {
      try {
        const result = await sendCommandToFigma("set_blend_mode", { nodeId, blendMode });
        const typedResult = result as { name: string; blendMode: string };
        return {
          content: [
            {
              type: "text",
              text: `Set blend mode of "${typedResult.name}" to ${typedResult.blendMode}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting blend mode: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Gradient Fill Tool
  server.tool(
    "set_gradient_fill",
    "Apply a gradient paint to a node fill",
    {
      nodeId: z.string().describe("Node ID"),
      gradientType: z.enum(["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"]).describe("Gradient type"),
      stops: z.array(z.object({
        position: z.coerce.number().min(0).max(1).describe("Stop position 0-1"),
        r: z.coerce.number().min(0).max(1).describe("Red 0-1"),
        g: z.coerce.number().min(0).max(1).describe("Green 0-1"),
        b: z.coerce.number().min(0).max(1).describe("Blue 0-1"),
        a: z.coerce.number().min(0).max(1).optional().describe("Alpha 0-1 (default 1)"),
      })).min(2).describe("Gradient stops"),
    },
    async ({ nodeId, gradientType, stops }) => {
      try {
        const result = await sendCommandToFigma("set_gradient_fill", { nodeId, gradientType, stops });
        const typedResult = result as { name: string; gradientType: string; stopCount: number };
        return {
          content: [
            {
              type: "text",
              text: `Applied ${typedResult.gradientType} gradient with ${typedResult.stopCount} stops to "${typedResult.name}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting gradient fill: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Rename Node Tool
  server.tool(
    "rename_node",
    "Rename a node (frame, component, group, etc.) in Figma",
    {
      nodeId: z.string().describe("The ID of the node to rename"),
      name: z.string().describe("The new name for the node"),
    },
    async ({ nodeId, name }) => {
      try {
        const result = await sendCommandToFigma("rename_node", {
          nodeId,
          name,
        });
        const typedResult = result as { id: string; name: string; oldName: string; type: string };
        return {
          content: [
            {
              type: "text",
              text: `Renamed ${typedResult.type} from "${typedResult.oldName}" to "${typedResult.name}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error renaming node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
