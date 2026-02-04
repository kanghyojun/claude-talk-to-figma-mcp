import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerModificationTools } from "../../../src/talk_to_figma_mcp/tools/modification-tools";
import { registerTextTools } from "../../../src/talk_to_figma_mcp/tools/text-tools";

jest.mock("../../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("P4/P5 tools unit", () => {
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
    mockSendCommand.mockResolvedValue({ name: "Mock Node", blendMode: "MULTIPLY" });

    const originalTool = server.tool.bind(server);
    jest.spyOn(server, "tool").mockImplementation((...args: any[]) => {
      if (args.length === 4) {
        const [name, _description, schema, handler] = args;
        handlers[name] = handler;
        schemas[name] = z.object(schema);
      }
      return (originalTool as any)(...args);
    });

    registerModificationTools(server);
    registerTextTools(server);
  });

  async function callTool(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("set_blend_mode forwards payload", async () => {
    await callTool("set_blend_mode", {
      nodeId: "2:2",
      blendMode: "MULTIPLY",
    });

    expect(mockSendCommand).toHaveBeenCalledWith("set_blend_mode", {
      nodeId: "2:2",
      blendMode: "MULTIPLY",
    });
  });

  it("set_gradient_fill rejects invalid stops count at schema level", async () => {
    await expect(
      callTool("set_gradient_fill", {
        nodeId: "2:2",
        gradientType: "GRADIENT_LINEAR",
        stops: [{ position: 0, r: 1, g: 1, b: 1, a: 1 }],
      })
    ).rejects.toThrow();
  });

  it("set_range_font_size forwards payload", async () => {
    await callTool("set_range_font_size", {
      nodeId: "3:1",
      start: 0,
      end: 5,
      fontSize: 18,
    });

    expect(mockSendCommand).toHaveBeenCalledWith("set_range_font_size", {
      nodeId: "3:1",
      start: 0,
      end: 5,
      fontSize: 18,
    });
  });

  it("set_text_align_horizontal returns error message when websocket fails", async () => {
    mockSendCommand.mockRejectedValueOnce(new Error("network fail"));

    const result = await callTool("set_text_align_horizontal", {
      nodeId: "3:1",
      textAlignHorizontal: "CENTER",
    });

    expect(result.content[0].text).toContain("Error setting text alignment: network fail");
  });
});
