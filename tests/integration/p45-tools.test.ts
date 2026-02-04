import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerModificationTools } from "../../src/talk_to_figma_mcp/tools/modification-tools";
import { registerTextTools } from "../../src/talk_to_figma_mcp/tools/text-tools";

jest.mock("../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("P4/P5 tools integration", () => {
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
    mockSendCommand.mockResolvedValue({ name: "Mock Node", alignment: "left", alignedCount: 2, direction: "horizontal", spacing: 20, distributedCount: 3 });

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

  async function callToolWithValidation(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("set_locked sends expected payload", async () => {
    await callToolWithValidation("set_locked", { nodeId: "1:2", locked: true });
    expect(mockSendCommand).toHaveBeenCalledWith("set_locked", { nodeId: "1:2", locked: true });
  });

  it("align_nodes validates and sends payload", async () => {
    await callToolWithValidation("align_nodes", { nodeIds: ["1:1", "1:2"], alignment: "left" });
    expect(mockSendCommand).toHaveBeenCalledWith("align_nodes", { nodeIds: ["1:1", "1:2"], alignment: "left" });
  });

  it("distribute_nodes rejects less than 3 nodes", async () => {
    await expect(callToolWithValidation("distribute_nodes", { nodeIds: ["1:1", "1:2"], direction: "horizontal" })).rejects.toThrow();
    expect(mockSendCommand).not.toHaveBeenCalled();
  });

  it("set_gradient_fill sends expected payload", async () => {
    await callToolWithValidation("set_gradient_fill", {
      nodeId: "1:2",
      gradientType: "GRADIENT_LINEAR",
      stops: [
        { position: 0, r: 1, g: 0, b: 0, a: 1 },
        { position: 1, r: 0, g: 0, b: 1, a: 1 },
      ],
    });
    expect(mockSendCommand).toHaveBeenCalledWith("set_gradient_fill", {
      nodeId: "1:2",
      gradientType: "GRADIENT_LINEAR",
      stops: [
        { position: 0, r: 1, g: 0, b: 0, a: 1 },
        { position: 1, r: 0, g: 0, b: 1, a: 1 },
      ],
    });
  });

  it("set_text_align_horizontal sends expected payload", async () => {
    await callToolWithValidation("set_text_align_horizontal", {
      nodeId: "2:3",
      textAlignHorizontal: "CENTER",
    });
    expect(mockSendCommand).toHaveBeenCalledWith("set_text_align_horizontal", {
      nodeId: "2:3",
      textAlignHorizontal: "CENTER",
    });
  });

  it("set_range_font_name sends expected payload", async () => {
    await callToolWithValidation("set_range_font_name", {
      nodeId: "2:3",
      start: 0,
      end: 4,
      family: "Inter",
      style: "Bold",
    });
    expect(mockSendCommand).toHaveBeenCalledWith("set_range_font_name", {
      nodeId: "2:3",
      start: 0,
      end: 4,
      family: "Inter",
      style: "Bold",
    });
  });
});
