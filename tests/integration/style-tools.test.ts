import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStyleTools } from "../../src/talk_to_figma_mcp/tools/style-tools";

jest.mock("../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("style tools integration", () => {
  let server: McpServer;
  let mockSendCommand: jest.Mock;
  const handlers: Record<string, Function> = {};
  const schemas: Record<string, z.ZodObject<any>> = {};

  beforeEach(() => {
    server = new McpServer(
      { name: "test-server", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    mockSendCommand = require("../../src/talk_to_figma_mcp/utils/websocket").sendCommandToFigma;
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue({ name: "Mock Node", id: "style-id", key: "style-key", styleName: "Mock Style" });

    const originalTool = server.tool.bind(server);
    jest.spyOn(server, "tool").mockImplementation((...args: any[]) => {
      if (args.length === 4) {
        const [name, _description, schema, handler] = args;
        handlers[name] = handler;
        schemas[name] = z.object(schema);
      }
      return (originalTool as any)(...args);
    });

    registerStyleTools(server);
  });

  async function callToolWithValidation(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  describe("create_paint_style", () => {
    it("sends expected command with default alpha", async () => {
      await callToolWithValidation("create_paint_style", {
        name: "Brand/Primary",
        r: 0.1,
        g: 0.2,
        b: 0.3,
      });

      expect(mockSendCommand).toHaveBeenCalledWith("create_paint_style", {
        name: "Brand/Primary",
        color: { r: 0.1, g: 0.2, b: 0.3, a: 1 },
        description: undefined,
      });
    });
  });

  describe("create_text_style", () => {
    it("sends expected command payload", async () => {
      await callToolWithValidation("create_text_style", {
        name: "Body/Regular",
        fontFamily: "Inter",
        fontStyle: "Regular",
        fontSize: 16,
        lineHeightPx: 24,
        letterSpacingPx: 0,
      });

      expect(mockSendCommand).toHaveBeenCalledWith("create_text_style", {
        name: "Body/Regular",
        fontFamily: "Inter",
        fontStyle: "Regular",
        fontSize: 16,
        lineHeightPx: 24,
        letterSpacingPx: 0,
        description: undefined,
      });
    });
  });

  describe("set_fill_style_id", () => {
    it("sends expected command payload", async () => {
      await callToolWithValidation("set_fill_style_id", {
        nodeId: "123:456",
        fillStyleId: "S:abcdef",
      });

      expect(mockSendCommand).toHaveBeenCalledWith("set_fill_style_id", {
        nodeId: "123:456",
        fillStyleId: "S:abcdef",
      });
    });
  });
});
