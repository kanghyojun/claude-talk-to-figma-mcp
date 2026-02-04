import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStyleTools } from "../../../src/talk_to_figma_mcp/tools/style-tools";

jest.mock("../../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("style tools unit", () => {
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
    mockSendCommand.mockResolvedValue({ id: "S:1", name: "Brand/Primary", key: "abc" });

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

  async function callTool(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("create_paint_style uses alpha=1 default", async () => {
    await callTool("create_paint_style", {
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

  it("create_text_style returns friendly error message when websocket fails", async () => {
    mockSendCommand.mockRejectedValueOnce(new Error("socket down"));

    const result = await callTool("create_text_style", {
      name: "Body/Regular",
    });

    expect(result.content[0].text).toContain("Error creating text style: socket down");
  });

  it("set_fill_style_id returns success message with style name", async () => {
    mockSendCommand.mockResolvedValueOnce({
      name: "Card Background",
      styleName: "Brand/Primary",
    });

    const result = await callTool("set_fill_style_id", {
      nodeId: "5:1",
      fillStyleId: "S:abc123",
    });

    expect(result.content[0].text).toBe('Applied fill style "Brand/Primary" to node "Card Background"');
  });

  it("set_fill_style_id returns error message for non-Error exceptions", async () => {
    mockSendCommand.mockRejectedValueOnce({ code: 404 });

    const result = await callTool("set_fill_style_id", {
      nodeId: "5:1",
      fillStyleId: "S:invalid",
    });

    expect(result.content[0].text).toContain("Error setting fill style:");
  });
});
