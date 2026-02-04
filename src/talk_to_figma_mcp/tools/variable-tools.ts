import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";

/**
 * Register variable-related tools to the MCP server
 * This module contains tools for working with Figma Variables (design tokens)
 * @param server - The MCP server instance
 */
export function registerVariableTools(server: McpServer): void {
  // Create Variable Collection Tool
  server.tool(
    "create_variable_collection",
    "Create a new variable collection in Figma for organizing design tokens",
    {
      name: z.string().describe("Name of the variable collection"),
    },
    async ({ name }) => {
      try {
        const result = await sendCommandToFigma("create_variable_collection", {
          name,
        });
        const typedResult = result as {
          id: string;
          name: string;
          modes: Array<{ modeId: string; name: string }>;
          defaultModeId: string;
        };
        return {
          content: [
            {
              type: "text",
              text: `Created variable collection "${typedResult.name}" with ID: ${typedResult.id}. Default mode ID: ${typedResult.defaultModeId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating variable collection: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Variable Tool
  server.tool(
    "create_variable",
    "Create a new variable (design token) in a Figma variable collection",
    {
      name: z.string().describe("Name of the variable"),
      collectionId: z.string().describe("ID of the variable collection to add the variable to"),
      resolvedType: z
        .enum(["BOOLEAN", "COLOR", "FLOAT", "STRING"])
        .describe("Type of the variable: BOOLEAN, COLOR, FLOAT, or STRING"),
      value: z
        .union([
          z.boolean(),
          z.number(),
          z.string(),
          z.object({
            r: z.number().min(0).max(1).describe("Red channel (0-1)"),
            g: z.number().min(0).max(1).describe("Green channel (0-1)"),
            b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
            a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1, default: 1)"),
          }),
        ])
        .optional()
        .describe("Initial value for the variable. For COLOR type, use {r, g, b, a} object with 0-1 values"),
      modeId: z.string().optional().describe("Mode ID to set the value for. If not provided, uses default mode"),
    },
    async ({ name, collectionId, resolvedType, value, modeId }) => {
      try {
        const result = await sendCommandToFigma("create_variable", {
          name,
          collectionId,
          resolvedType,
          value,
          modeId,
        });
        const typedResult = result as {
          id: string;
          name: string;
          resolvedType: string;
          collectionId: string;
        };
        return {
          content: [
            {
              type: "text",
              text: `Created ${typedResult.resolvedType} variable "${typedResult.name}" with ID: ${typedResult.id}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating variable: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Variable by ID Tool
  server.tool(
    "get_variable_by_id",
    "Retrieve a variable by its ID from Figma",
    {
      variableId: z.string().describe("ID of the variable to retrieve"),
    },
    async ({ variableId }) => {
      try {
        const result = await sendCommandToFigma("get_variable_by_id", {
          variableId,
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
              text: `Error getting variable: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Local Variable Collections Tool
  server.tool(
    "get_local_variable_collections",
    "Get all local variable collections in the current Figma file",
    {},
    async () => {
      try {
        const result = await sendCommandToFigma("get_local_variable_collections", {});
        const typedResult = result as Array<{
          id: string;
          name: string;
          modes: Array<{ modeId: string; name: string }>;
          defaultModeId: string;
          variableIds: string[];
        }>;
        return {
          content: [
            {
              type: "text",
              text: `Found ${typedResult.length} variable collection(s):\n${JSON.stringify(typedResult, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting variable collections: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Local Variables Tool
  server.tool(
    "get_local_variables",
    "Get all local variables in the current Figma file",
    {
      collectionId: z.string().optional().describe("Optional collection ID to filter variables"),
    },
    async ({ collectionId }) => {
      try {
        const result = await sendCommandToFigma("get_local_variables", {
          collectionId,
        });
        const typedResult = result as Array<{
          id: string;
          name: string;
          resolvedType: string;
          collectionId: string;
          valuesByMode: Record<string, unknown>;
        }>;
        return {
          content: [
            {
              type: "text",
              text: `Found ${typedResult.length} variable(s):\n${JSON.stringify(typedResult, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting variables: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Bound Variable Tool
  server.tool(
    "set_bound_variable",
    "Bind a variable to a node property in Figma (e.g., bind a color variable to fill)",
    {
      nodeId: z.string().describe("ID of the node to bind the variable to"),
      field: z
        .enum([
          "fill",
          "stroke",
          "opacity",
          "width",
          "height",
          "paddingTop",
          "paddingRight",
          "paddingBottom",
          "paddingLeft",
          "itemSpacing",
          "counterAxisSpacing",
          "cornerRadius",
          "topLeftRadius",
          "topRightRadius",
          "bottomLeftRadius",
          "bottomRightRadius",
        ])
        .describe("The property field to bind the variable to"),
      variableId: z.string().describe("ID of the variable to bind"),
    },
    async ({ nodeId, field, variableId }) => {
      try {
        const result = await sendCommandToFigma("set_bound_variable", {
          nodeId,
          field,
          variableId,
        });
        const typedResult = result as { success: boolean; nodeId: string; field: string };
        return {
          content: [
            {
              type: "text",
              text: `Successfully bound variable to "${typedResult.field}" on node ${typedResult.nodeId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error binding variable: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
