import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendCommandToFigma } from "../utils/websocket";
import * as fs from "fs";
import * as path from "path";

// File logger for component tools debugging
const LOG_DIR = "/tmp/claude-talk-to-figma-mcp";
const LOG_FILE = path.join(LOG_DIR, "component-tools.log");

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
 * Register component-related tools to the MCP server
 * This module contains tools for working with components in Figma
 * @param server - The MCP server instance
 */
export function registerComponentTools(server: McpServer): void {
  // Create Component Tool
  server.tool(
    "create_component",
    "Create a new reusable component in Figma",
    {
      name: z.string().optional().describe("Optional component name"),
      x: z.coerce.number().optional().describe("X position (default: 0)"),
      y: z.coerce.number().optional().describe("Y position (default: 0)"),
      width: z.coerce.number().positive().optional().describe("Width (default: 100)"),
      height: z.coerce.number().positive().optional().describe("Height (default: 100)"),
    },
    async ({ name, x, y, width, height }) => {
      logToFile("INFO", "create_component called", { name, x, y, width, height });
      try {
        logToFile("DEBUG", "Sending command to Figma", { command: "create_component", params: { name, x, y, width, height } });
        const result = await sendCommandToFigma("create_component", {
          name,
          x,
          y,
          width,
          height,
        });
        logToFile("DEBUG", "Received result from Figma", { resultType: typeof result, result });
        const typedResult = result as { id: string; name: string; key: string };
        logToFile("INFO", "create_component success", { id: typedResult.id, name: typedResult.name, key: typedResult.key });
        return {
          content: [
            {
              type: "text",
              text: `Created component "${typedResult.name}" with ID: ${typedResult.id} and key: ${typedResult.key}.`,
            }
          ]
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logToFile("ERROR", "create_component failed", { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
        return {
          content: [
            {
              type: "text",
              text: `Error creating component: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Add Component Property Tool
  server.tool(
    "add_component_property",
    "Add a component property (variant, boolean, text, instance swap) to a component in Figma",
    {
      componentId: z.string().describe("ID of the component"),
      propertyName: z.string().describe("Name of the property to add"),
      propertyType: z.enum(["BOOLEAN", "TEXT", "INSTANCE_SWAP", "VARIANT"]).describe("Type of component property"),
      defaultValue: z.union([z.string(), z.boolean()]).optional().describe("Optional default value"),
    },
    async ({ componentId, propertyName, propertyType, defaultValue }) => {
      try {
        const result = await sendCommandToFigma("add_component_property", {
          componentId,
          propertyName,
          propertyType,
          defaultValue,
        });
        const typedResult = result as { name: string; propertyName: string; propertyType: string };
        return {
          content: [
            {
              type: "text",
              text: `Added ${typedResult.propertyType} property "${typedResult.propertyName}" to component "${typedResult.name}".`,
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error adding component property: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Instance Properties Tool
  server.tool(
    "set_properties",
    "Set properties on a component instance in Figma",
    {
      instanceId: z.string().describe("ID of the instance node"),
      properties: z.record(z.string(), z.union([z.string(), z.boolean()])).describe("Property map to set on the instance"),
    },
    async ({ instanceId, properties }) => {
      try {
        const result = await sendCommandToFigma("set_properties", {
          instanceId,
          properties,
        });
        const typedResult = result as { name: string };
        return {
          content: [
            {
              type: "text",
              text: `Updated ${Object.keys(properties).length} instance propertie(s) on "${typedResult.name}".`,
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting instance properties: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Component Instance Tool
  server.tool(
    "create_component_instance",
    "Create an instance of a component in Figma",
    {
      componentKey: z.string().describe("Key of the component to instantiate"),
      x: z.coerce.number().describe("X position"),
      y: z.coerce.number().describe("Y position"),
    },
    async ({ componentKey, x, y }) => {
      try {
        const result = await sendCommandToFigma("create_component_instance", {
          componentKey,
          x,
          y,
        });
        const typedResult = result as any;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(typedResult),
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating component instance: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Component from Node Tool
  server.tool(
    "create_component_from_node",
    "Convert an existing node (frame, group, etc.) into a reusable component in Figma",
    {
      nodeId: z.string().describe("The ID of the node to convert into a component"),
      name: z.string().optional().describe("Optional new name for the component"),
    },
    async ({ nodeId, name }) => {
      try {
        const result = await sendCommandToFigma("create_component_from_node", {
          nodeId,
          name,
        });
        const typedResult = result as { id: string; name: string; key: string };
        return {
          content: [
            {
              type: "text",
              text: `Created component "${typedResult.name}" with ID: ${typedResult.id} and key: ${typedResult.key}. You can now create instances of this component using the key.`,
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating component from node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Create Component Set from Components Tool
  server.tool(
    "create_component_set",
    "Create a component set (variants) from multiple component nodes in Figma",
    {
      componentIds: z.array(z.string()).describe("Array of component node IDs to combine into a component set"),
      name: z.string().optional().describe("Optional name for the component set"),
    },
    async ({ componentIds, name }) => {
      try {
        const result = await sendCommandToFigma("create_component_set", {
          componentIds,
          name,
        });
        const typedResult = result as { id: string; name: string; key: string; variantCount: number };
        return {
          content: [
            {
              type: "text",
              text: `Created component set "${typedResult.name}" with ID: ${typedResult.id}, key: ${typedResult.key}, containing ${typedResult.variantCount} variants.`,
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating component set: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
