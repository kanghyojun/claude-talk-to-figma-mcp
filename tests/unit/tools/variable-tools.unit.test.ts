import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerVariableTools } from "../../../src/talk_to_figma_mcp/tools/variable-tools";

jest.mock("../../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("variable tools unit", () => {
  let server: McpServer;
  let mockSendCommand: jest.Mock;
  const handlers: Record<string, Function> = {};
  const schemas: Record<string, z.ZodObject<any>> = {};

  beforeEach(() => {
    server = new McpServer(
      { name: "test-server", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    mockSendCommand = require("../../../src/talk_to_figma_mcp/utils/websocket").sendCommandToFigma;
    mockSendCommand.mockReset();

    const originalTool = server.tool.bind(server);
    jest.spyOn(server, "tool").mockImplementation((...args: any[]) => {
      if (args.length === 4) {
        const [name, _description, schema, handler] = args;
        handlers[name] = handler;
        schemas[name] = z.object(schema);
      }
      return (originalTool as any)(...args);
    });

    registerVariableTools(server);
  });

  async function callTool(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  describe("create_variable_collection", () => {
    it("returns collection info on success", async () => {
      mockSendCommand.mockResolvedValueOnce({
        id: "VC:1",
        name: "Design Tokens",
        modes: [{ modeId: "M1", name: "Default" }],
        defaultModeId: "M1",
      });

      const result = await callTool("create_variable_collection", {
        name: "Design Tokens",
      });

      expect(result.content[0].text).toBe(
        'Created variable collection "Design Tokens" with ID: VC:1. Default mode ID: M1'
      );
    });

    it("returns error message when websocket fails", async () => {
      mockSendCommand.mockRejectedValueOnce(new Error("connection lost"));

      const result = await callTool("create_variable_collection", {
        name: "Tokens",
      });

      expect(result.content[0].text).toContain("Error creating variable collection: connection lost");
    });
  });

  describe("create_variable", () => {
    it("forwards all parameters including optional modeId", async () => {
      mockSendCommand.mockResolvedValueOnce({
        id: "V:1",
        name: "primary-color",
        resolvedType: "COLOR",
        collectionId: "VC:1",
      });

      await callTool("create_variable", {
        name: "primary-color",
        collectionId: "VC:1",
        resolvedType: "COLOR",
        value: { r: 0.2, g: 0.4, b: 0.8 },
        modeId: "M1",
      });

      expect(mockSendCommand).toHaveBeenCalledWith("create_variable", {
        name: "primary-color",
        collectionId: "VC:1",
        resolvedType: "COLOR",
        value: { r: 0.2, g: 0.4, b: 0.8 },
        modeId: "M1",
      }, 10000);
    });

    it("returns error message for non-Error exceptions", async () => {
      mockSendCommand.mockRejectedValueOnce("string error");

      const result = await callTool("create_variable", {
        name: "spacing",
        collectionId: "VC:1",
        resolvedType: "FLOAT",
      });

      expect(result.content[0].text).toBe("Error creating variable: string error");
    });
  });

  describe("set_bound_variable", () => {
    it("returns success message with field name", async () => {
      mockSendCommand.mockResolvedValueOnce({
        success: true,
        nodeId: "1:2",
        field: "fill",
      });

      const result = await callTool("set_bound_variable", {
        nodeId: "1:2",
        field: "fill",
        variableId: "V:1",
      });

      expect(result.content[0].text).toBe('Successfully bound variable to "fill" on node 1:2');
    });

    it("rejects invalid field at schema level", async () => {
      await expect(
        callTool("set_bound_variable", {
          nodeId: "1:2",
          field: "invalid_field",
          variableId: "V:1",
        })
      ).rejects.toThrow();
    });
  });
});
