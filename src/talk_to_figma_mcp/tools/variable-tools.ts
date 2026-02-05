import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";
import * as fs from "fs";
import * as path from "path";

// File logger for variable tools debugging
const LOG_DIR = "/tmp/claude-talk-to-figma-mcp";
const LOG_FILE = path.join(LOG_DIR, "variable-tools.log");

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logToFile(level: string, message: string, data?: unknown): void {
  ensureLogDir();
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data !== undefined ? ` | Data: ${JSON.stringify(data)}` : ""}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}

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
        }, 10000);
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
          z.coerce.number(),
          z.string(),
          z.object({
            r: z.coerce.number().min(0).max(1).describe("Red channel (0-1)"),
            g: z.coerce.number().min(0).max(1).describe("Green channel (0-1)"),
            b: z.coerce.number().min(0).max(1).describe("Blue channel (0-1)"),
            a: z.coerce.number().min(0).max(1).optional().describe("Alpha channel (0-1, default: 1)"),
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
        }, 10000);
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
        }, 10000);
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
      logToFile("INFO", "get_local_variable_collections called");
      try {
        logToFile("DEBUG", "Sending command to Figma", { command: "get_local_variable_collections" });
        const result = await sendCommandToFigma("get_local_variable_collections", {}, 10000);
        logToFile("DEBUG", "Received result from Figma", { resultType: typeof result, isArray: Array.isArray(result) });
        const typedResult = result as Array<{
          id: string;
          name: string;
          modes: Array<{ modeId: string; name: string }>;
          defaultModeId: string;
          variableIds: string[];
        }>;
        logToFile("INFO", "get_local_variable_collections success", { collectionCount: typedResult.length });
        return {
          content: [
            {
              type: "text",
              text: `Found ${typedResult.length} variable collection(s):\n${JSON.stringify(typedResult, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logToFile("ERROR", "get_local_variable_collections failed", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
        return {
          content: [
            {
              type: "text",
              text: `Error getting variable collections: ${errorMessage}`,
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
      logToFile("INFO", "get_local_variables called", { collectionId });
      try {
        logToFile("DEBUG", "Sending command to Figma", { command: "get_local_variables", params: { collectionId } });
        const result = await sendCommandToFigma("get_local_variables", {
          collectionId,
        }, 10000);
        logToFile("DEBUG", "Received result from Figma", { resultType: typeof result, isArray: Array.isArray(result) });
        const typedResult = result as Array<{
          id: string;
          name: string;
          resolvedType: string;
          collectionId: string;
          valuesByMode: Record<string, unknown>;
        }>;
        logToFile("INFO", "get_local_variables success", { variableCount: typedResult.length });
        return {
          content: [
            {
              type: "text",
              text: `Found ${typedResult.length} variable(s):\n${JSON.stringify(typedResult, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logToFile("ERROR", "get_local_variables failed", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
        return {
          content: [
            {
              type: "text",
              text: `Error getting variables: ${errorMessage}`,
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
        }, 10000);
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
